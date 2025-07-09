<?php
/**
 * Classe para gerenciar o acesso ao banco de dados dos eventos
 * 
 * Esta classe lida diretamente com as tabelas do WordPress onde
 * o Events Calendar Pro armazena os dados dos eventos
 */

if (!defined('ABSPATH')) {
    exit;
}

class VendzzEventsDatabase {
    
    private $wpdb;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }
    
    /**
     * Obter eventos com filtros avançados
     * 
     * @param array $args Argumentos de filtro
     * @return array Lista de eventos
     */
    public function get_events($args = array()) {
        $defaults = array(
            'search' => '',
            'status' => '',
            'recurrence' => '',
            'page' => 1,
            'per_page' => 20,
            'orderby' => 'start_date',
            'order' => 'ASC',
            'date_from' => '',
            'date_to' => '',
            'venue_id' => '',
            'category_id' => ''
        );
        
        $args = wp_parse_args($args, $defaults);
        $offset = ($args['page'] - 1) * $args['per_page'];
        
        // Query base
        $sql = "
            SELECT DISTINCT 
                p.ID,
                p.post_title,
                p.post_content,
                p.post_status,
                p.post_date,
                p.post_modified,
                start_meta.meta_value as start_date,
                end_meta.meta_value as end_date,
                venue_meta.meta_value as venue_id,
                recurrence_meta.meta_value as recurrence_data,
                allday_meta.meta_value as all_day,
                cost_meta.meta_value as cost,
                url_meta.meta_value as event_url,
                timezone_meta.meta_value as timezone
            FROM {$this->wpdb->posts} p
            LEFT JOIN {$this->wpdb->postmeta} start_meta ON (p.ID = start_meta.post_id AND start_meta.meta_key = '_EventStartDate')
            LEFT JOIN {$this->wpdb->postmeta} end_meta ON (p.ID = end_meta.post_id AND end_meta.meta_key = '_EventEndDate')
            LEFT JOIN {$this->wpdb->postmeta} venue_meta ON (p.ID = venue_meta.post_id AND venue_meta.meta_key = '_EventVenueID')
            LEFT JOIN {$this->wpdb->postmeta} recurrence_meta ON (p.ID = recurrence_meta.post_id AND recurrence_meta.meta_key = '_EventRecurrence')
            LEFT JOIN {$this->wpdb->postmeta} allday_meta ON (p.ID = allday_meta.post_id AND allday_meta.meta_key = '_EventAllDay')
            LEFT JOIN {$this->wpdb->postmeta} cost_meta ON (p.ID = cost_meta.post_id AND cost_meta.meta_key = '_EventCost')
            LEFT JOIN {$this->wpdb->postmeta} url_meta ON (p.ID = url_meta.post_id AND url_meta.meta_key = '_EventURL')
            LEFT JOIN {$this->wpdb->postmeta} timezone_meta ON (p.ID = timezone_meta.post_id AND timezone_meta.meta_key = '_EventTimezone')
            WHERE p.post_type = 'tribe_events'
        ";
        
        $where_conditions = array();
        $sql_params = array();
        
        // Filtro por busca
        if (!empty($args['search'])) {
            $where_conditions[] = "(p.post_title LIKE %s OR p.post_content LIKE %s)";
            $search_term = '%' . $this->wpdb->esc_like($args['search']) . '%';
            $sql_params[] = $search_term;
            $sql_params[] = $search_term;
        }
        
        // Filtro por status
        if (!empty($args['status'])) {
            $where_conditions[] = "p.post_status = %s";
            $sql_params[] = $args['status'];
        } else {
            $where_conditions[] = "p.post_status IN ('publish', 'draft', 'private')";
        }
        
        // Filtro por recorrência
        if ($args['recurrence'] === 'recurring') {
            $where_conditions[] = "recurrence_meta.meta_value IS NOT NULL AND recurrence_meta.meta_value != ''";
        } elseif ($args['recurrence'] === 'single') {
            $where_conditions[] = "(recurrence_meta.meta_value IS NULL OR recurrence_meta.meta_value = '')";
        }
        
        // Filtro por data
        if (!empty($args['date_from'])) {
            $where_conditions[] = "start_meta.meta_value >= %s";
            $sql_params[] = $args['date_from'];
        }
        
        if (!empty($args['date_to'])) {
            $where_conditions[] = "end_meta.meta_value <= %s";
            $sql_params[] = $args['date_to'];
        }
        
        // Filtro por venue
        if (!empty($args['venue_id'])) {
            $where_conditions[] = "venue_meta.meta_value = %s";
            $sql_params[] = $args['venue_id'];
        }
        
        // Filtro por categoria
        if (!empty($args['category_id'])) {
            $sql .= " LEFT JOIN {$this->wpdb->term_relationships} tr ON p.ID = tr.object_id";
            $where_conditions[] = "tr.term_taxonomy_id = %s";
            $sql_params[] = $args['category_id'];
        }
        
        // Adicionar condições WHERE
        if (!empty($where_conditions)) {
            $sql .= " AND " . implode(' AND ', $where_conditions);
        }
        
        // Ordenação
        $order_by = $this->get_order_by_clause($args['orderby'], $args['order']);
        $sql .= " ORDER BY " . $order_by;
        
        // Paginação
        $sql .= " LIMIT %d OFFSET %d";
        $sql_params[] = $args['per_page'];
        $sql_params[] = $offset;
        
        // Preparar e executar query
        if (!empty($sql_params)) {
            $prepared_sql = $this->wpdb->prepare($sql, $sql_params);
        } else {
            $prepared_sql = $sql;
        }
        
        $results = $this->wpdb->get_results($prepared_sql);
        
        // Processar resultados
        $events = array();
        foreach ($results as $row) {
            $events[] = $this->process_event_row($row);
        }
        
        return $events;
    }
    
    /**
     * Contar total de eventos
     * 
     * @param array $args Argumentos de filtro
     * @return int Total de eventos
     */
    public function count_events($args = array()) {
        $defaults = array(
            'search' => '',
            'status' => '',
            'recurrence' => '',
            'date_from' => '',
            'date_to' => '',
            'venue_id' => '',
            'category_id' => ''
        );
        
        $args = wp_parse_args($args, $defaults);
        
        // Query de contagem
        $sql = "
            SELECT COUNT(DISTINCT p.ID)
            FROM {$this->wpdb->posts} p
            LEFT JOIN {$this->wpdb->postmeta} start_meta ON (p.ID = start_meta.post_id AND start_meta.meta_key = '_EventStartDate')
            LEFT JOIN {$this->wpdb->postmeta} end_meta ON (p.ID = end_meta.post_id AND end_meta.meta_key = '_EventEndDate')
            LEFT JOIN {$this->wpdb->postmeta} venue_meta ON (p.ID = venue_meta.post_id AND venue_meta.meta_key = '_EventVenueID')
            LEFT JOIN {$this->wpdb->postmeta} recurrence_meta ON (p.ID = recurrence_meta.post_id AND recurrence_meta.meta_key = '_EventRecurrence')
            WHERE p.post_type = 'tribe_events'
        ";
        
        $where_conditions = array();
        $sql_params = array();
        
        // Aplicar mesmas condições da query principal
        if (!empty($args['search'])) {
            $where_conditions[] = "(p.post_title LIKE %s OR p.post_content LIKE %s)";
            $search_term = '%' . $this->wpdb->esc_like($args['search']) . '%';
            $sql_params[] = $search_term;
            $sql_params[] = $search_term;
        }
        
        if (!empty($args['status'])) {
            $where_conditions[] = "p.post_status = %s";
            $sql_params[] = $args['status'];
        } else {
            $where_conditions[] = "p.post_status IN ('publish', 'draft', 'private')";
        }
        
        if ($args['recurrence'] === 'recurring') {
            $where_conditions[] = "recurrence_meta.meta_value IS NOT NULL AND recurrence_meta.meta_value != ''";
        } elseif ($args['recurrence'] === 'single') {
            $where_conditions[] = "(recurrence_meta.meta_value IS NULL OR recurrence_meta.meta_value = '')";
        }
        
        if (!empty($args['date_from'])) {
            $where_conditions[] = "start_meta.meta_value >= %s";
            $sql_params[] = $args['date_from'];
        }
        
        if (!empty($args['date_to'])) {
            $where_conditions[] = "end_meta.meta_value <= %s";
            $sql_params[] = $args['date_to'];
        }
        
        if (!empty($args['venue_id'])) {
            $where_conditions[] = "venue_meta.meta_value = %s";
            $sql_params[] = $args['venue_id'];
        }
        
        if (!empty($args['category_id'])) {
            $sql .= " LEFT JOIN {$this->wpdb->term_relationships} tr ON p.ID = tr.object_id";
            $where_conditions[] = "tr.term_taxonomy_id = %s";
            $sql_params[] = $args['category_id'];
        }
        
        if (!empty($where_conditions)) {
            $sql .= " AND " . implode(' AND ', $where_conditions);
        }
        
        if (!empty($sql_params)) {
            $prepared_sql = $this->wpdb->prepare($sql, $sql_params);
        } else {
            $prepared_sql = $sql;
        }
        
        return (int) $this->wpdb->get_var($prepared_sql);
    }
    
    /**
     * Obter detalhes completos de um evento
     * 
     * @param int $event_id ID do evento
     * @return array|false Dados do evento ou false se não encontrado
     */
    public function get_event_details($event_id) {
        $event_id = (int) $event_id;
        
        $sql = "
            SELECT 
                p.ID,
                p.post_title,
                p.post_content,
                p.post_excerpt,
                p.post_status,
                p.post_date,
                p.post_modified,
                p.post_author
            FROM {$this->wpdb->posts} p
            WHERE p.ID = %d AND p.post_type = 'tribe_events'
        ";
        
        $event = $this->wpdb->get_row($this->wpdb->prepare($sql, $event_id));
        
        if (!$event) {
            return false;
        }
        
        // Obter todos os metadados do evento
        $meta_data = $this->get_event_meta($event_id);
        
        // Obter dados do venue
        $venue_data = $this->get_venue_data($meta_data['venue_id'] ?? '');
        
        // Obter dados do organizador
        $organizer_data = $this->get_organizer_data($meta_data['organizer_id'] ?? '');
        
        // Obter categorias
        $categories = $this->get_event_categories_for_event($event_id);
        
        // Obter tags
        $tags = $this->get_event_tags($event_id);
        
        return array(
            'id' => $event->ID,
            'title' => $event->post_title,
            'content' => $event->post_content,
            'excerpt' => $event->post_excerpt,
            'status' => $event->post_status,
            'date_created' => $event->post_date,
            'date_modified' => $event->post_modified,
            'author_id' => $event->post_author,
            'meta' => $meta_data,
            'venue' => $venue_data,
            'organizer' => $organizer_data,
            'categories' => $categories,
            'tags' => $tags,
            'recurrence_info' => $this->format_recurrence_info($meta_data['recurrence'] ?? ''),
            'is_recurring' => !empty($meta_data['recurrence']),
            'all_day' => $meta_data['all_day'] === 'yes',
            'cost' => $meta_data['cost'] ?? '',
            'url' => $meta_data['url'] ?? '',
            'timezone' => $meta_data['timezone'] ?? ''
        );
    }
    
    /**
     * Obter metadados do evento
     * 
     * @param int $event_id ID do evento
     * @return array Metadados do evento
     */
    private function get_event_meta($event_id) {
        $meta_keys = array(
            '_EventStartDate' => 'start_date',
            '_EventEndDate' => 'end_date',
            '_EventStartDateUTC' => 'start_date_utc',
            '_EventEndDateUTC' => 'end_date_utc',
            '_EventVenueID' => 'venue_id',
            '_EventOrganizerID' => 'organizer_id',
            '_EventRecurrence' => 'recurrence',
            '_EventAllDay' => 'all_day',
            '_EventCost' => 'cost',
            '_EventCurrencySymbol' => 'currency_symbol',
            '_EventURL' => 'url',
            '_EventTimezone' => 'timezone',
            '_EventHideFromUpcoming' => 'hide_from_upcoming',
            '_EventShowMapLink' => 'show_map_link',
            '_EventShowMap' => 'show_map',
            '_EventDuration' => 'duration',
            '_EventEndTime' => 'end_time'
        );
        
        $meta_data = array();
        
        foreach ($meta_keys as $meta_key => $array_key) {
            $value = get_post_meta($event_id, $meta_key, true);
            $meta_data[$array_key] = $value;
        }
        
        return $meta_data;
    }
    
    /**
     * Obter dados do venue
     * 
     * @param int $venue_id ID do venue
     * @return array|null Dados do venue
     */
    private function get_venue_data($venue_id) {
        if (empty($venue_id)) {
            return null;
        }
        
        $venue = get_post($venue_id);
        if (!$venue || $venue->post_type !== 'tribe_venue') {
            return null;
        }
        
        return array(
            'id' => $venue->ID,
            'name' => $venue->post_title,
            'description' => $venue->post_content,
            'address' => get_post_meta($venue_id, '_VenueAddress', true),
            'city' => get_post_meta($venue_id, '_VenueCity', true),
            'state' => get_post_meta($venue_id, '_VenueState', true),
            'zip' => get_post_meta($venue_id, '_VenueZip', true),
            'country' => get_post_meta($venue_id, '_VenueCountry', true),
            'phone' => get_post_meta($venue_id, '_VenuePhone', true),
            'website' => get_post_meta($venue_id, '_VenueURL', true)
        );
    }
    
    /**
     * Obter dados do organizador
     * 
     * @param int $organizer_id ID do organizador
     * @return array|null Dados do organizador
     */
    private function get_organizer_data($organizer_id) {
        if (empty($organizer_id)) {
            return null;
        }
        
        $organizer = get_post($organizer_id);
        if (!$organizer || $organizer->post_type !== 'tribe_organizer') {
            return null;
        }
        
        return array(
            'id' => $organizer->ID,
            'name' => $organizer->post_title,
            'description' => $organizer->post_content,
            'email' => get_post_meta($organizer_id, '_OrganizerEmail', true),
            'website' => get_post_meta($organizer_id, '_OrganizerWebsite', true),
            'phone' => get_post_meta($organizer_id, '_OrganizerPhone', true)
        );
    }
    
    /**
     * Obter categorias do evento
     * 
     * @param int $event_id ID do evento
     * @return array Lista de categorias
     */
    private function get_event_categories_for_event($event_id) {
        $categories = wp_get_post_terms($event_id, 'tribe_events_cat');
        
        if (is_wp_error($categories)) {
            return array();
        }
        
        return array_map(function($cat) {
            return array(
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description
            );
        }, $categories);
    }
    
    /**
     * Obter tags do evento
     * 
     * @param int $event_id ID do evento
     * @return array Lista de tags
     */
    private function get_event_tags($event_id) {
        $tags = wp_get_post_terms($event_id, 'post_tag');
        
        if (is_wp_error($tags)) {
            return array();
        }
        
        return array_map(function($tag) {
            return array(
                'id' => $tag->term_id,
                'name' => $tag->name,
                'slug' => $tag->slug
            );
        }, $tags);
    }
    
    /**
     * Processar linha de resultado do evento
     * 
     * @param object $row Linha do resultado da query
     * @return array Dados processados do evento
     */
    private function process_event_row($row) {
        $venue_name = '';
        if (!empty($row->venue_id)) {
            $venue = get_post($row->venue_id);
            $venue_name = $venue ? $venue->post_title : '';
        }
        
        return array(
            'id' => $row->ID,
            'title' => $row->post_title,
            'content' => $row->post_content,
            'status' => $row->post_status,
            'date_created' => $row->post_date,
            'date_modified' => $row->post_modified,
            'start_date' => $row->start_date,
            'end_date' => $row->end_date,
            'venue' => $venue_name,
            'venue_id' => $row->venue_id,
            'is_recurring' => !empty($row->recurrence_data),
            'recurrence_info' => $this->format_recurrence_info($row->recurrence_data),
            'all_day' => $row->all_day === 'yes',
            'cost' => $row->cost,
            'url' => $row->event_url,
            'timezone' => $row->timezone,
            'edit_url' => get_edit_post_link($row->ID),
            'view_url' => get_permalink($row->ID)
        );
    }
    
    /**
     * Obter cláusula ORDER BY
     * 
     * @param string $orderby Campo de ordenação
     * @param string $order Direção da ordenação
     * @return string Cláusula ORDER BY
     */
    private function get_order_by_clause($orderby, $order) {
        $order = strtoupper($order) === 'DESC' ? 'DESC' : 'ASC';
        
        switch ($orderby) {
            case 'title':
                return "p.post_title $order";
            case 'date_created':
                return "p.post_date $order";
            case 'date_modified':
                return "p.post_modified $order";
            case 'end_date':
                return "end_meta.meta_value $order";
            case 'start_date':
            default:
                return "start_meta.meta_value $order";
        }
    }
    
    /**
     * Formatar informações de recorrência
     * 
     * @param string $recurrence_data Dados de recorrência serializados
     * @return string Informações formatadas
     */
    private function format_recurrence_info($recurrence_data) {
        if (empty($recurrence_data)) {
            return __('Evento único', 'vendzz-events-manager');
        }
        
        $recurrence = maybe_unserialize($recurrence_data);
        
        if (!is_array($recurrence)) {
            return __('Recorrência personalizada', 'vendzz-events-manager');
        }
        
        $info = array();
        
        if (isset($recurrence['rules'])) {
            foreach ($recurrence['rules'] as $rule) {
                $type = $rule['type'] ?? '';
                $interval = $rule['custom']['interval'] ?? 1;
                
                switch ($type) {
                    case 'Daily':
                        $info[] = sprintf(__('Diário (a cada %d dia(s))', 'vendzz-events-manager'), $interval);
                        break;
                    case 'Weekly':
                        $info[] = sprintf(__('Semanal (a cada %d semana(s))', 'vendzz-events-manager'), $interval);
                        break;
                    case 'Monthly':
                        $info[] = sprintf(__('Mensal (a cada %d mês(es))', 'vendzz-events-manager'), $interval);
                        break;
                    case 'Yearly':
                        $info[] = sprintf(__('Anual (a cada %d ano(s))', 'vendzz-events-manager'), $interval);
                        break;
                    default:
                        $info[] = __('Recorrência personalizada', 'vendzz-events-manager');
                }
            }
        }
        
        return !empty($info) ? implode(', ', $info) : __('Recorrência personalizada', 'vendzz-events-manager');
    }
    
    /**
     * Obter lista de venues
     * 
     * @return array Lista de venues
     */
    public function get_venues() {
        $venues = get_posts(array(
            'post_type' => 'tribe_venue',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'title',
            'order' => 'ASC'
        ));
        
        $venue_list = array();
        foreach ($venues as $venue) {
            $venue_list[] = array(
                'id' => $venue->ID,
                'name' => $venue->post_title,
                'address' => get_post_meta($venue->ID, '_VenueAddress', true),
                'city' => get_post_meta($venue->ID, '_VenueCity', true)
            );
        }
        
        return $venue_list;
    }
    
    /**
     * Obter categorias de eventos
     * 
     * @return array Lista de categorias
     */
    public function get_event_categories() {
        $categories = get_terms(array(
            'taxonomy' => 'tribe_events_cat',
            'hide_empty' => false,
            'orderby' => 'name',
            'order' => 'ASC'
        ));
        
        if (is_wp_error($categories)) {
            return array();
        }
        
        return array_map(function($cat) {
            return array(
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'count' => $cat->count
            );
        }, $categories);
    }
}
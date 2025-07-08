<?php
/**
 * Editor customizado para eventos recorrentes
 * Permite editar todos os horários/ocorrências como uma única entidade
 */

if (!defined('ABSPATH')) {
    exit;
}

class VendzzRecurringEventsEditor {
    
    private $wpdb;
    
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }
    
    /**
     * Obter evento recorrente completo com todas as ocorrências
     */
    public function get_recurring_event($event_id) {
        // Buscar evento principal
        $event = get_post($event_id);
        if (!$event || $event->post_type !== 'tribe_events') {
            return null;
        }
        
        // Buscar configurações de recorrência
        $recurrence_meta = get_post_meta($event_id, '_EventRecurrence', true);
        $start_date = get_post_meta($event_id, '_EventStartDate', true);
        $end_date = get_post_meta($event_id, '_EventEndDate', true);
        $venue_id = get_post_meta($event_id, '_EventVenueID', true);
        $organizer_id = get_post_meta($event_id, '_EventOrganizerID', true);
        
        // Buscar todas as ocorrências existentes
        $occurrences = $this->get_event_occurrences($event_id);
        
        // Venue info
        $venue_name = '';
        if ($venue_id) {
            $venue = get_post($venue_id);
            if ($venue) {
                $venue_name = $venue->post_title;
            }
        }
        
        // Organizer info
        $organizer_name = '';
        if ($organizer_id) {
            $organizer = get_post($organizer_id);
            if ($organizer) {
                $organizer_name = $organizer->post_title;
            }
        }
        
        return array(
            'id' => $event_id,
            'title' => $event->post_title,
            'description' => $event->post_content,
            'status' => $event->post_status,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'venue_id' => $venue_id,
            'venue_name' => $venue_name,
            'organizer_id' => $organizer_id,
            'organizer_name' => $organizer_name,
            'recurrence' => $recurrence_meta,
            'occurrences' => $occurrences,
            'is_recurring' => !empty($recurrence_meta)
        );
    }
    
    /**
     * Buscar todas as ocorrências de um evento recorrente
     */
    public function get_event_occurrences($event_id) {
        // Buscar ocorrências na tabela de eventos
        $sql = "SELECT 
                    p.ID,
                    p.post_title,
                    p.post_status,
                    em_start.meta_value as start_date,
                    em_end.meta_value as end_date,
                    em_parent.meta_value as parent_event
                FROM {$this->wpdb->posts} p
                LEFT JOIN {$this->wpdb->postmeta} em_start ON p.ID = em_start.post_id AND em_start.meta_key = '_EventStartDate'
                LEFT JOIN {$this->wpdb->postmeta} em_end ON p.ID = em_end.post_id AND em_end.meta_key = '_EventEndDate'
                LEFT JOIN {$this->wpdb->postmeta} em_parent ON p.ID = em_parent.post_id AND em_parent.meta_key = '_EventParentID'
                WHERE p.post_type = 'tribe_events' 
                AND (em_parent.meta_value = %s OR p.ID = %s)
                ORDER BY em_start.meta_value ASC";
        
        $results = $this->wpdb->get_results($this->wpdb->prepare($sql, $event_id, $event_id));
        
        $occurrences = array();
        foreach ($results as $result) {
            $occurrences[] = array(
                'id' => $result->ID,
                'title' => $result->post_title,
                'status' => $result->post_status,
                'start_date' => $result->start_date,
                'end_date' => $result->end_date,
                'is_parent' => ($result->ID == $event_id),
                'formatted_start' => $this->format_date($result->start_date),
                'formatted_end' => $this->format_date($result->end_date)
            );
        }
        
        return $occurrences;
    }
    
    /**
     * Adicionar nova ocorrência a um evento recorrente
     */
    public function add_occurrence($parent_event_id, $start_date, $end_date, $custom_title = '') {
        $parent_event = get_post($parent_event_id);
        if (!$parent_event) {
            return false;
        }
        
        $title = !empty($custom_title) ? $custom_title : $parent_event->post_title;
        
        // Criar nova ocorrência
        $new_occurrence = array(
            'post_type' => 'tribe_events',
            'post_title' => $title,
            'post_content' => $parent_event->post_content,
            'post_status' => 'publish',
            'post_author' => $parent_event->post_author
        );
        
        $occurrence_id = wp_insert_post($new_occurrence);
        
        if (is_wp_error($occurrence_id)) {
            return false;
        }
        
        // Copiar metadados do evento pai
        $this->copy_event_meta($parent_event_id, $occurrence_id);
        
        // Definir datas específicas
        update_post_meta($occurrence_id, '_EventStartDate', $start_date);
        update_post_meta($occurrence_id, '_EventEndDate', $end_date);
        update_post_meta($occurrence_id, '_EventParentID', $parent_event_id);
        
        return $occurrence_id;
    }
    
    /**
     * Editar ocorrência existente
     */
    public function edit_occurrence($occurrence_id, $data) {
        $occurrence = get_post($occurrence_id);
        if (!$occurrence) {
            return false;
        }
        
        // Atualizar post
        $updated_post = array(
            'ID' => $occurrence_id,
            'post_title' => $data['title'],
            'post_content' => $data['description'],
            'post_status' => $data['status']
        );
        
        $result = wp_update_post($updated_post);
        
        if (is_wp_error($result)) {
            return false;
        }
        
        // Atualizar metadados
        update_post_meta($occurrence_id, '_EventStartDate', $data['start_date']);
        update_post_meta($occurrence_id, '_EventEndDate', $data['end_date']);
        
        if (!empty($data['venue_id'])) {
            update_post_meta($occurrence_id, '_EventVenueID', $data['venue_id']);
        }
        
        if (!empty($data['organizer_id'])) {
            update_post_meta($occurrence_id, '_EventOrganizerID', $data['organizer_id']);
        }
        
        return true;
    }
    
    /**
     * Excluir ocorrência
     */
    public function delete_occurrence($occurrence_id) {
        $occurrence = get_post($occurrence_id);
        if (!$occurrence) {
            return false;
        }
        
        // Verificar se não é o evento pai
        $parent_id = get_post_meta($occurrence_id, '_EventParentID', true);
        if (empty($parent_id)) {
            return false; // Não permitir excluir evento pai
        }
        
        return wp_delete_post($occurrence_id, true);
    }
    
    /**
     * Atualizar evento recorrente completo
     */
    public function update_recurring_event($event_id, $data) {
        // Atualizar evento principal
        $updated_event = array(
            'ID' => $event_id,
            'post_title' => $data['title'],
            'post_content' => $data['description'],
            'post_status' => $data['status']
        );
        
        $result = wp_update_post($updated_event);
        
        if (is_wp_error($result)) {
            return false;
        }
        
        // Atualizar metadados principais
        update_post_meta($event_id, '_EventStartDate', $data['start_date']);
        update_post_meta($event_id, '_EventEndDate', $data['end_date']);
        
        if (!empty($data['venue_id'])) {
            update_post_meta($event_id, '_EventVenueID', $data['venue_id']);
        }
        
        if (!empty($data['organizer_id'])) {
            update_post_meta($event_id, '_EventOrganizerID', $data['organizer_id']);
        }
        
        // Atualizar configurações de recorrência
        if (!empty($data['recurrence'])) {
            update_post_meta($event_id, '_EventRecurrence', $data['recurrence']);
        }
        
        return true;
    }
    
    /**
     * Gerar ocorrências automáticas baseadas na regra de recorrência
     */
    public function generate_occurrences($event_id, $recurrence_rule, $end_date = null) {
        $base_event = get_post($event_id);
        if (!$base_event) {
            return false;
        }
        
        $start_date = get_post_meta($event_id, '_EventStartDate', true);
        $event_duration = strtotime(get_post_meta($event_id, '_EventEndDate', true)) - strtotime($start_date);
        
        $occurrences = array();
        $current_date = strtotime($start_date);
        $limit_date = $end_date ? strtotime($end_date) : strtotime('+1 year', $current_date);
        
        // Interpretar regra de recorrência
        $interval = $this->parse_recurrence_rule($recurrence_rule);
        
        while ($current_date < $limit_date) {
            $current_date = strtotime($interval, $current_date);
            
            if ($current_date >= $limit_date) {
                break;
            }
            
            $occurrence_start = date('Y-m-d H:i:s', $current_date);
            $occurrence_end = date('Y-m-d H:i:s', $current_date + $event_duration);
            
            $occurrence_id = $this->add_occurrence($event_id, $occurrence_start, $occurrence_end);
            
            if ($occurrence_id) {
                $occurrences[] = $occurrence_id;
            }
        }
        
        return $occurrences;
    }
    
    /**
     * Buscar venues disponíveis
     */
    public function get_venues() {
        $venues = get_posts(array(
            'post_type' => 'tribe_venue',
            'posts_per_page' => -1,
            'post_status' => 'publish'
        ));
        
        $result = array();
        foreach ($venues as $venue) {
            $result[] = array(
                'id' => $venue->ID,
                'name' => $venue->post_title
            );
        }
        
        return $result;
    }
    
    /**
     * Buscar organizadores disponíveis
     */
    public function get_organizers() {
        $organizers = get_posts(array(
            'post_type' => 'tribe_organizer',
            'posts_per_page' => -1,
            'post_status' => 'publish'
        ));
        
        $result = array();
        foreach ($organizers as $organizer) {
            $result[] = array(
                'id' => $organizer->ID,
                'name' => $organizer->post_title
            );
        }
        
        return $result;
    }
    
    /**
     * Copiar metadados do evento pai para ocorrência
     */
    private function copy_event_meta($parent_id, $child_id) {
        $meta_keys = array(
            '_EventVenueID',
            '_EventOrganizerID',
            '_EventAllDay',
            '_EventTimezone',
            '_EventRecurrence'
        );
        
        foreach ($meta_keys as $meta_key) {
            $meta_value = get_post_meta($parent_id, $meta_key, true);
            if (!empty($meta_value)) {
                update_post_meta($child_id, $meta_key, $meta_value);
            }
        }
    }
    
    /**
     * Formatar data para exibição
     */
    private function format_date($date) {
        if (empty($date)) {
            return '';
        }
        
        return date('d/m/Y H:i', strtotime($date));
    }
    
    /**
     * Interpretar regra de recorrência simples
     */
    private function parse_recurrence_rule($rule) {
        // Regras básicas de recorrência
        $rules = array(
            'daily' => '+1 day',
            'weekly' => '+1 week',
            'monthly' => '+1 month',
            'yearly' => '+1 year'
        );
        
        return isset($rules[$rule]) ? $rules[$rule] : '+1 week';
    }
}
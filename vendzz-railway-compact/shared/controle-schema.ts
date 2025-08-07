import { text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de atendentes
export const atendentes = sqliteTable("atendentes", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  telefone: text("telefone").notNull(),
  meta_vendas_diaria: integer("meta_vendas_diaria").default(4),
  comissao_percentual: real("comissao_percentual").default(10.0),
  ativo: integer("ativo").default(1),
  created_at: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Tabela de gastos de campanha por atendente/dia
export const gastos_campanha = sqliteTable("gastos_campanha", {
  id: text("id").primaryKey(),
  atendente_id: text("atendente_id").notNull(),
  data: text("data").notNull(), // YYYY-MM-DD
  valor_gasto: real("valor_gasto").notNull(),
  leads_recebidos: integer("leads_recebidos").default(0),
  plataforma: text("plataforma").default("Facebook"), // Facebook, Google, etc
  created_at: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Tabela de vendas/pedidos
export const vendas = sqliteTable("vendas", {
  id: text("id").primaryKey(),
  atendente_id: text("atendente_id").notNull(),
  cliente_nome: text("cliente_nome").notNull(),
  cliente_telefone: text("cliente_telefone").notNull(),
  cliente_endereco: text("cliente_endereco"),
  valor_venda: real("valor_venda").notNull(),
  comissao_calculada: real("comissao_calculada").default(0),
  categoria: text("categoria").notNull(), // 'LOGZZ' ou 'AFTER PAY'
  forma_pagamento: text("forma_pagamento"), // 'credito', 'debito', 'boleto', 'pix'
  status: text("status").notNull(), // 'agendado', 'pago', 'cancelado'
  data_pedido: text("data_pedido").notNull(), // Data/hora automática do pedido
  data_agendamento: text("data_agendamento"), // Para quando foi agendada a entrega
  periodo_entrega: text("periodo_entrega"), // 'manha', 'tarde', 'noite'
  observacoes: text("observacoes"),
  created_at: text("created_at").default("CURRENT_TIMESTAMP"),
  updated_at: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabela de metas e configurações
export const configuracoes = sqliteTable("configuracoes", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  meta_vendas_mensal: integer("meta_vendas_mensal").default(120),
  limite_dias_agendamento: integer("limite_dias_agendamento").default(30),
  alerta_pedidos_proximos: integer("alerta_pedidos_proximos").default(2), // horas antes
  created_at: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Schemas de inserção com validação
export const insertAtendenteSchema = createInsertSchema(atendentes).omit({
  id: true,
  created_at: true,
});

export const insertGastoCampanhaSchema = createInsertSchema(gastos_campanha).omit({
  id: true,
  created_at: true,
});

export const insertVendaSchema = createInsertSchema(vendas, {
  valor_venda: z.number().min(0.01, "Valor deve ser maior que 0"),
  categoria: z.enum(["LOGZZ", "AFTER PAY"]),
  forma_pagamento: z.enum(["credito", "debito", "boleto", "pix"]).optional(),
  status: z.enum(["agendado", "pago", "cancelado"]),
  periodo_entrega: z.enum(["manha", "tarde", "noite"]).optional(),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
  comissao_calculada: true,
  data_pedido: true, // Será gerado automaticamente
});

export const insertConfiguracaoSchema = createInsertSchema(configuracoes).omit({
  id: true,
  created_at: true,
});

// Tipos inferidos
export type Atendente = typeof atendentes.$inferSelect;
export type InsertAtendente = z.infer<typeof insertAtendenteSchema>;

export type GastoCampanha = typeof gastos_campanha.$inferSelect;
export type InsertGastoCampanha = z.infer<typeof insertGastoCampanhaSchema>;

export type Venda = typeof vendas.$inferSelect;
export type InsertVenda = z.infer<typeof insertVendaSchema>;

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = z.infer<typeof insertConfiguracaoSchema>;
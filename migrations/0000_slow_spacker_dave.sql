CREATE TABLE "quiz_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" uuid NOT NULL,
	"date" timestamp DEFAULT now(),
	"views" integer DEFAULT 0,
	"starts" integer DEFAULT 0,
	"completions" integer DEFAULT 0,
	"leads" integer DEFAULT 0,
	"conversion_rate" numeric DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "quiz_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"email" varchar,
	"name" varchar,
	"phone" varchar,
	"responses" jsonb NOT NULL,
	"result" jsonb,
	"score" numeric,
	"completed_at" timestamp DEFAULT now(),
	"ip_address" varchar,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "quiz_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"thumbnail" varchar,
	"structure" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"template_id" integer,
	"title" varchar NOT NULL,
	"description" text,
	"structure" jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}',
	"is_published" boolean DEFAULT false,
	"embed_code" text,
	"facebook_pixel" varchar,
	"google_pixel" varchar,
	"ga4_id" varchar,
	"custom_head_script" text,
	"branding_logo" varchar,
	"progress_bar_color" varchar DEFAULT '#10b981',
	"button_color" varchar DEFAULT '#10b981',
	"favicon" varchar,
	"seo_title" varchar,
	"seo_description" text,
	"seo_keywords" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"password" varchar,
	"refresh_token" text,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'user' NOT NULL,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"subscription_status" varchar DEFAULT 'inactive',
	"plan" varchar DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "quiz_analytics" ADD CONSTRAINT "quiz_analytics_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_template_id_quiz_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."quiz_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
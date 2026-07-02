CREATE TABLE "linkinbio_link_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"linkinbio_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkinbio_linkinbios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"theme" text DEFAULT 'midnight' NOT NULL,
	"button_style" text DEFAULT 'rounded' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "linkinbio_linkinbios_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "linkinbio_linkinbios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "linkinbio_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"linkinbio_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkinbio_page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"linkinbio_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "linkinbio_link_clicks" ADD CONSTRAINT "linkinbio_link_clicks_link_id_linkinbio_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."linkinbio_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkinbio_link_clicks" ADD CONSTRAINT "linkinbio_link_clicks_linkinbio_id_linkinbio_linkinbios_id_fk" FOREIGN KEY ("linkinbio_id") REFERENCES "public"."linkinbio_linkinbios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkinbio_links" ADD CONSTRAINT "linkinbio_links_linkinbio_id_linkinbio_linkinbios_id_fk" FOREIGN KEY ("linkinbio_id") REFERENCES "public"."linkinbio_linkinbios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkinbio_page_views" ADD CONSTRAINT "linkinbio_page_views_linkinbio_id_linkinbio_linkinbios_id_fk" FOREIGN KEY ("linkinbio_id") REFERENCES "public"."linkinbio_linkinbios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "linkinbio_link_clicks_link_idx" ON "linkinbio_link_clicks" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "linkinbio_link_clicks_linkinbio_created_idx" ON "linkinbio_link_clicks" USING btree ("linkinbio_id","created_at");--> statement-breakpoint
CREATE INDEX "linkinbio_links_linkinbio_idx" ON "linkinbio_links" USING btree ("linkinbio_id");--> statement-breakpoint
CREATE INDEX "linkinbio_page_views_linkinbio_created_idx" ON "linkinbio_page_views" USING btree ("linkinbio_id","created_at");
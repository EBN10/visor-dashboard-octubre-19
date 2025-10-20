CREATE TYPE "public"."layer_kind" AS ENUM('vector', 'xyz', 'wms');--> statement-breakpoint
CREATE TABLE "layer_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "layers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" "layer_kind" NOT NULL,
	"group_id" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"default_visible" boolean DEFAULT false NOT NULL,
	"config" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "layer_groups" ADD CONSTRAINT "layer_groups_parent_id_layer_groups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."layer_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "layers" ADD CONSTRAINT "layers_group_id_layer_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."layer_groups"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS pais8622_geom_gix
  ON carto_censal.pais8622
  USING GIST (geom);
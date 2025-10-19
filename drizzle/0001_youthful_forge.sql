CREATE SCHEMA "carto_censal";
--> statement-breakpoint
CREATE TABLE "carto_censal"."pais8622" (
	"id" integer NOT NULL,
	"cpr" varchar(2),
	"jur" text,
	"cde" varchar(3),
	"dpto" text,
	"cfn" varchar(2),
	"cro" varchar(2),
	"tro" char(1),
	"cod_indec" varchar(9) NOT NULL,
	"shape_area" double precision,
	"shape_len" double precision,
	"geom" geometry(point) NOT NULL,
	CONSTRAINT "pais8622_cod_indec_pk" PRIMARY KEY("cod_indec")
);

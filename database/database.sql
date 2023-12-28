DROP TABLE users CASCADE;
DROP TABLE posts CASCADE;
DROP TABLE replies CASCADE;
DROP TABLE tags CASCADE;
DROP TABLE post_tag CASCADE;
DROP TABLE likes CASCADE;

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" varchar UNIQUE NOT NULL,
  "role" varchar NOT NULL,
  "password" VARCHAR NOT NULL,
  "created_at" timestamp WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "posts" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar NOT NULL,
  "content" text NOT NULL,
  "user_id" integer,
  "created_at" timestamp WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tags" (
  "id" SERIAL PRIMARY KEY,
  "description" varchar NOT NULL UNIQUE,
  "created_at" timestamp WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "post_tag" (
  "tag_id" integer,
  "post_id" integer
);

CREATE TABLE "replies" (
  "id" SERIAL PRIMARY KEY,
  "content" varchar NOT NULL,
  "post_id" integer,
  "user_id" integer,
  "created_at" timestamp WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "likes" (
    "like_or_dislike" boolean NOT NULL,
    "post_id" integer,
    "user_id" integer
);

ALTER TABLE "posts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "post_tag" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE;

ALTER TABLE "post_tag" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE;

ALTER TABLE "replies" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE;

ALTER TABLE "replies" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "likes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "likes" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE;

ALTER TABLE "replies" ADD CONSTRAINT "reply_check_min_length_content" CHECK (length("content") >= 1);

ALTER TABLE "posts" ADD CONSTRAINT "post_check_min_length_title" CHECK (length("title") >= 1);

ALTER TABLE "posts" ADD CONSTRAINT "post_check_min_length_content" CHECK (length("content") >= 1);

ALTER TABLE "users" ADD CONSTRAINT "user_check_min_length_username" CHECK (length("username") >= 4);


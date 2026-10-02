import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const lectureSources = mysqlTable("lecture_sources", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["pasted_text", "text_file"]).notNull(),
  fileName: varchar("fileName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 120 }),
  content: text("content").notNull(),
  durationSeconds: int("durationSeconds"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorCode: varchar("errorCode", { length: 80 }),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userStatusIdx: index("lecture_sources_user_status_idx").on(table.userId, table.status) }));

export const processingRuns = mysqlTable("processing_runs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceId: int("sourceId").notNull().references(() => lectureSources.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  promptVersion: varchar("promptVersion", { length: 64 }).notNull(),
  modelId: varchar("modelId", { length: 128 }),
  schemaVersion: varchar("schemaVersion", { length: 32 }).notNull(),
  inputTokens: int("inputTokens"),
  outputTokens: int("outputTokens"),
  durationMs: int("durationMs"),
  errorCode: varchar("errorCode", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ sourceIdx: index("processing_runs_source_idx").on(table.sourceId, table.createdAt) }));

export const notebooks = mysqlTable("notebooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceId: int("sourceId").notNull().references(() => lectureSources.id, { onDelete: "cascade" }),
  processingRunId: int("processingRunId").notNull().references(() => processingRuns.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  schemaVersion: varchar("schemaVersion", { length: 32 }).notNull(),
  status: mysqlEnum("status", ["draft", "ready", "archived"]).default("draft").notNull(),
  note: json("note").notNull(),
  lessonPath: json("lessonPath"),
  version: int("version").default(1).notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userUpdatedIdx: index("notebooks_user_updated_idx").on(table.userId, table.updatedAt) }));

export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  notebookId: int("notebookId").notNull().references(() => notebooks.id, { onDelete: "cascade" }),
  notebookVersion: int("notebookVersion").notNull(),
  kind: mysqlEnum("kind", ["knowledge_check", "exam_review"]).notNull(),
  prompt: text("prompt").notNull(),
  answerGuide: text("answerGuide"),
  position: int("position").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ notebookIdx: index("assessments_notebook_idx").on(table.notebookId, table.position) }));

export const assessmentAttempts = mysqlTable("assessment_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  assessmentId: int("assessmentId").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  answer: text("answer").notNull(),
  outcome: mysqlEnum("outcome", ["submitted", "evaluated", "invalidated"]).default("submitted").notNull(),
  score: int("score"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ attemptIdx: index("assessment_attempts_user_assessment_idx").on(table.userId, table.assessmentId, table.createdAt) }));

export const masteryItems = mysqlTable("mastery_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  notebookId: int("notebookId").notNull().references(() => notebooks.id, { onDelete: "cascade" }),
  conceptKey: varchar("conceptKey", { length: 160 }).notNull(),
  conceptLabel: varchar("conceptLabel", { length: 255 }).notNull(),
  level: int("level").default(0).notNull(),
  confidence: int("confidence").default(0).notNull(),
  dueAt: timestamp("dueAt"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userDueIdx: index("mastery_items_user_due_idx").on(table.userId, table.dueAt) }));

export const revisions = mysqlTable("revisions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  masteryItemId: int("masteryItemId").notNull().references(() => masteryItems.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["recommended", "started", "completed", "skipped"]).default("recommended").notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userScheduleIdx: index("revisions_user_schedule_idx").on(table.userId, table.scheduledFor) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LectureSource = typeof lectureSources.$inferSelect;
export type InsertLectureSource = typeof lectureSources.$inferInsert;
export type ProcessingRun = typeof processingRuns.$inferSelect;
export type Notebook = typeof notebooks.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type MasteryItem = typeof masteryItems.$inferSelect;
export type Revision = typeof revisions.$inferSelect;

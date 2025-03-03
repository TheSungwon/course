import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, description, id, name, updatedAt } from "../schemaHelpers";
import { CourseProductTable } from "./courseProduct";
import { UserCourseAccessTable } from "./userCourseAccess";
import { CourseSectionTable } from "./courseSection";

export const CourseTable = pgTable("courses", {
  id,
  name,
  description,
  createdAt,
  updatedAt,
});

export const CourseRelationships = relations(CourseTable, ({ many }) => ({
  corseProducts: many(CourseProductTable),
  userCourseAccesses: many(UserCourseAccessTable),
  courseSections: many(CourseSectionTable),
}));

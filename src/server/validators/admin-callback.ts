import { z } from "zod";

export const callbackListViewSchema = z.enum(["active", "archive"]);

export const listCallbacksAdminPageSchema = z.object({
  view: callbackListViewSchema.default("active"),
});

const callbackStatusSchema = z.enum(["PENDING", "CONSULTED"]);

export const updateCallbackStatusSchema = z.object({
  id: z.string().cuid("Невірний ідентифікатор заявки"),
  status: callbackStatusSchema,
});

export const updateCallbackNoteSchema = z.object({
  id: z.string().cuid("Невірний ідентифікатор заявки"),
  note: z.string().max(4000).optional(),
});

export const archiveCallbackSchema = z.object({
  id: z.string().cuid("Невірний ідентифікатор заявки"),
});

export type CallbackListView = z.output<typeof callbackListViewSchema>;
export type ListCallbacksAdminPageParams = z.output<
  typeof listCallbacksAdminPageSchema
>;

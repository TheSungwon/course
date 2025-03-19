"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequiredLabelIcon } from "@/components/ui/RequiredLabelIcon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { productSchema } from "../schemas/products";
import { ProductStatus, productStatuses } from "@/drizzle/schema";
import { createProduct, updateProduct } from "../actions/products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/custom/multi-select";

export function ProductForm({
  product,
  courses,
}: {
  product?: {
    id: string;
    name: string;
    description: string;
    priceInDollars: number;
    imageUrl: string;
    status: ProductStatus;
    courseIds: string[];
  };
  courses: {
    id: string;
    name: string;
  }[];
}) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: "",
      description: "",
      courseIds: [],
      imageUrl: "",
      priceInDollars: 0,
      status: "private",
    },
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    // const data = await createCourse(values);

    const action =
      product == null ? createProduct : updateProduct.bind(null, product.id);

    const data = await action(values);

    console.log(data, "--------------------");
    toast(data.message, {
      // duration: 4000,
      icon: <span>✔️</span>,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon
                    className="text-red-500 animate-ping"
                    color="green"
                  />
                  Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceInDollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon
                    className="text-red-500 animate-ping"
                    color="green"
                  />
                  Price
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step={1}
                    min={0}
                    onChange={(e) => {
                      const filteredValue = e.target.valueAsNumber
                        .toString()
                        .replace(/[^0-9.]/g, "");
                      field.onChange(parseInt(filteredValue));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon
                    className="text-red-500 animate-ping"
                    color="green"
                  />
                  Image URL
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon
                    className="text-red-500 animate-ping"
                    color="green"
                  />
                  Status
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-gray-700">
                      <SelectValue className="text-gray-700" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="courseIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabelIcon
                  className="text-red-500 animate-ping"
                  color="green"
                />
                Included Courses
              </FormLabel>
              <FormControl>
                <MultiSelect
                  selectPlaceholder="Select Courses"
                  searchPlaceholder="Search Courses"
                  options={courses}
                  getLabel={(c) => c.name}
                  getValue={(c) => c.id}
                  selectedValues={field.value}
                  onSelectedValuesChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabelIcon
                  className="text-red-500 animate-ping"
                  color="green"
                />
                Description
              </FormLabel>
              <FormControl>
                <Textarea className="min-h-20 resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="self-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

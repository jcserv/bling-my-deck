import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import currency from "@/assets/currency.json";

const decklistRegex = /^(\d+\s+.+?(?:\s+\([A-Z0-9]+\)\s+\d+)?(?:\s+\[[A-Z0-9]+\])?\s*\n?)+$/;

const formSchema = z.object({
  decklist: z.string().min(1, "Please enter one or more cards").regex(
    RegExp(decklistRegex),
    'Invalid decklist format'
  ),
  localCurrency: z.enum([currency[0].value, ...currency.map((currency) => currency.value)], {
    message: "Please select your local currency",
  }),
});

export const CartForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decklist: "",
      localCurrency: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="text-start flex gap-8"
        >
          <div className="flex-grow w-100">
            <FormField
              control={form.control}
              name="decklist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Decklist</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="4 Lightning Bolt"
                      className="h-64 w-[50vw]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-64 space-y-6">
            <FormField
              control={form.control}
              name="localCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your local currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currency.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.emoji} {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </>
  );
};
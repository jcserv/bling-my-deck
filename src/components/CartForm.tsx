import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypeaheadTextarea } from "@/components/TypeaheadTextarea";
import { useLocalStorage } from "@/hooks/localStorage";
import {
  ONE_DAY_IN_MILLISECONDS,
  parseDeckList,
  AllFinishes,
  Currency,
  Exclusion,
  AllExclusions,
} from "@/types";

import currency from "@/assets/currency.json";
import { exampleDecklist } from "@/assets/exampleDecklist";
import { Finish } from "@/__generated__/graphql";

const decklistRegex =
  /^(\d+\s+.+?(?:\s+\([A-Z0-9]+\)\s+\d+)?(?:\s+\[[A-Z0-9]+\])?\s*\n?)+$/;

const formSchema = z.object({
  decklist: z
    .string()
    .min(1, "Please enter one or more cards")
    .regex(RegExp(decklistRegex), "Invalid decklist format")
    .refine(
      (decklist) => {
        return decklist.split(/\r?\n/).length <= 100;
      },
      {
        message: "Decklist cannot contain more than 100 cards",
      }
    ),
  treatments: z
    .array(z.nativeEnum(Finish))
    .min(1, "Please select one or more finishes"),
  exclusions: z.array(z.nativeEnum(Exclusion)),
  localCurrency: z.enum(
    [currency[0].value, ...currency.map((currency) => currency.value)],
    {
      message: "Please select your local currency",
    }
  ),
});

export const CartForm: React.FC = () => {
  const navigate = useNavigate();
  const [, setSubmission] = useLocalStorage(
    "submission",
    null,
    new Date(Date.now() + ONE_DAY_IN_MILLISECONDS)
  );
  const [, setLocalCurrency] = useLocalStorage(
    "localCurrency",
    Currency.USD,
    new Date(Date.now() + ONE_DAY_IN_MILLISECONDS)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decklist: "",
      treatments: [],
      localCurrency: "",
      exclusions: [],
    },
  });

  const numUniqueCards = form
    .watch("decklist")
    .split("\n")
    .filter((x) => x).length;

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmission({
      ...values,
      decklist: parseDeckList(values.decklist),
    });
    setLocalCurrency(values.localCurrency);
    navigate({
      to: "/overview",
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-4xl flex flex-col gap-4 p-4"
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="flex-grow min-w-0">
            <FormField
              control={form.control}
              name="decklist"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-end">
                    <FormLabel className="text-base">Decklist</FormLabel>
                    <p
                      className={`text-sm ml-2 ${
                        numUniqueCards > 100
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      ({numUniqueCards}/100 unique cards)
                    </p>
                  </div>
                  <FormControl>
                    <TypeaheadTextarea
                      placeholder="4 Lightning Bolt"
                      className="h-64 w-full resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:w-64 space-y-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="treatments"
                render={() => (
                  <FormItem>
                    <div>
                      <FormLabel className="text-base">Finishes</FormLabel>
                    </div>
                    {AllFinishes.map((finish) => (
                      <FormField
                        key={finish}
                        control={form.control}
                        name="treatments"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={finish}
                              className="flex flex-row items-start space-x-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    finish as Finish
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          finish,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== finish
                                          )
                                        );
                                  }}
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal leading-none capitalize">
                                {finish}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exclusions"
                render={() => (
                  <FormItem>
                    <div>
                      <FormLabel className="text-base">Exclude</FormLabel>
                    </div>
                    {AllExclusions.map((exclusion) => (
                      <FormField
                        key={exclusion}
                        control={form.control}
                        name="exclusions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={exclusion}
                              className="flex flex-row items-start space-x-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    exclusion as Exclusion
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          exclusion,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== exclusion
                                          )
                                        );
                                  }}
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal leading-none">
                                {exclusion}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="destructive"
            type="button"
            className="w-full"
            onClick={() => form.resetField("decklist")}
          >
            Clear
          </Button>
          <Button
            variant="secondary"
            type="button"
            className="w-full"
            onClick={() => form.setValue("decklist", exampleDecklist)}
          >
            Use sample deck
          </Button>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CartForm;

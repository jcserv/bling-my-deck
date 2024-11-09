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
import { AllTreatments, Treatment } from "@/types/treatment";
import { Checkbox } from "./ui/checkbox";
import { useLocalStorage } from "@/hooks/localStorage";
import { ONE_DAY_IN_MILLISECONDS } from "@/types/constants";
import { parseDeckList } from "@/types/card";
import { useNavigate } from "@tanstack/react-router";

const decklistRegex =
  /^(\d+\s+.+?(?:\s+\([A-Z0-9]+\)\s+\d+)?(?:\s+\[[A-Z0-9]+\])?\s*\n?)+$/;

const formSchema = z.object({
  decklist: z
    .string()
    .min(1, "Please enter one or more cards")
    .regex(RegExp(decklistRegex), 'Invalid decklist format')
  .refine(
    (decklist) => {
      return decklist.split(/\r?\n/).length <= 100
    },
    {
      message: "Decklist cannot contain more than 100 cards"
    }
  ),
  treatments: z.array(z.nativeEnum(Treatment), {
    message: "Please select one or more treatments",
  }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decklist: "",
      treatments: [],
      localCurrency: "",
    },
  });

  const numCards = form
    .watch("decklist")
    .split("\n")
    .filter((x) => x).length;

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmission({
      ...values,
      decklist: parseDeckList(values.decklist),
    });
    navigate({
      to: "/overview",
    });
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
                  <div className="flex flex-row items-end">
                    <FormLabel className="text-base">Decklist</FormLabel>
                    <p
                      className={`text-sm ml-2 ${numCards > 100 ? "text-red-500" : "text-muted-foreground"}`}
                    >
                      ({numCards}
                      /100 cards)
                    </p>
                  </div>
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
                        <SelectItem
                          key={currency.value}
                          value={currency.value}
                          disabled={currency.disabled}
                        >
                          {currency.emoji} {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="treatments"
              render={() => (
                <FormItem>
                  <div>
                    <FormLabel className="text-base">Treatments</FormLabel>
                  </div>
                  {AllTreatments.map((treatment) => (
                    <FormField
                      key={treatment}
                      control={form.control}
                      name="treatments"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={treatment}
                            className="flex flex-row items-start space-x-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(
                                  treatment as Treatment
                                )}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        treatment,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== treatment
                                        )
                                      );
                                }}
                                className="mt-2"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal leading-none">
                              {treatment}
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
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </>
  );
};

"use client"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import clsx from "clsx"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import {
  Form,
  FormDescription,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from "@/components/global/Loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MailCheck } from "lucide-react"
import { FormSchema } from "@/lib/types"
import { actionSignUpUser } from "@/lib/server-action/auth-action"

const SignUpFormSchema = z
  .object({
    email: z.string().describe("Email").email({ message: "Invalid Email" }),
    password: z
      .string()
      .describe("Password")
      .min(6, "Password must be minimum 6 characters"),
    confirmPassword: z
      .string()
      .describe("Confirm Password")
      .min(6, "Password must be minimum 6 characters"),
  })
  .refine((data) => (data.password = data.confirmPassword), {
    message: "Password don't match",
    path: ["confirmPassword"],
  })

const SignupPage = () => {
  const searchParams = useSearchParams()
  const [submitError, setSubmitError] = useState("")
  const [confirmation, setConfirmation] = useState(false)

  const codeExchangeError = useMemo(() => {
    if (!searchParams) return ""
    return searchParams.get("error_description")
  }, [searchParams])

  const confirmationErrorStyles = useMemo(
    () =>
      clsx("bg-primary", {
        "bg-red-500/10": codeExchangeError,
        "border-red-500/50": codeExchangeError,
        "text-red-700": codeExchangeError,
      }),
    []
  )

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  const isLoading = form.formState.isSubmitting

  const onSubmit = async ({ email, password }: z.infer<typeof FormSchema>) => {
    const { error } = await actionSignUpUser({ email, password })
    if (error) {
      setSubmitError(error.message)
      form.reset()
      return
    }
    setConfirmation(true)
  }

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("")
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link href="/" className="w-full flex justify-left items-center">
          <span className="text-4xl dark:text-white">squads</span>
        </Link>
        <FormDescription>
          An all-in-one collaboration and productivity
        </FormDescription>

        <FormField
          disabled={isLoading}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field}></Input>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          disabled={isLoading}
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  {...field}
                ></Input>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          disabled={isLoading}
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  {...field}
                ></Input>
              </FormControl>
            </FormItem>
          )}
        />
        {!confirmation && !codeExchangeError && (
          <>
            <Button type="submit" className="w-full p-6" disabled={isLoading}>
              {!isLoading ? "Create Account" : <Loader />}
            </Button>
          </>
        )}
        {submitError && <FormMessage>{submitError}</FormMessage>}
        <span className="self-container">
          Already have an account?{" "}
          <Link href="/login" className="text-primary">
            Login
          </Link>
        </span>
        {(confirmation || codeExchangeError) && (
          <>
            <Alert className={confirmationErrorStyles}>
              {!codeExchangeError && <MailCheck className="h-4 w-4" />}
              <AlertTitle>
                {codeExchangeError ? "Invalid Link" : "Check your email."}
              </AlertTitle>
              <AlertDescription>
                {codeExchangeError || "An email confirmation has been sent"}
              </AlertDescription>
            </Alert>
          </>
        )}
      </form>
    </Form>
  )
}

export default SignupPage

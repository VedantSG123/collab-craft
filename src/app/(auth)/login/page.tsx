"use client"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormSchema } from "@/lib/types"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Loader from "@/components/global/Loader"
import { actionLoginUser } from "@/lib/server-action/auth-action"

const LoginPage = () => {
  const [submitError, setSubmitError] = useState("")
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  })

  const isLoading = form.formState.isSubmitting
  const onSubmmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData
  ) => {
    const { error } = await actionLoginUser(formData)
    if (error) {
      form.reset()
      setSubmitError(error.message)
    }
    router.replace("/dashboard")
  }
  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("")
        }}
        onSubmit={form.handleSubmit(onSubmmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link href="/" className="w-full flex justify-left items-center">
          <span className="text-4xl dark:text-white">Collab Craft</span>
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
        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button
          type="submit"
          className="w-full p-6"
          size="sm"
          disabled={isLoading}
          variant={"default"}
        >
          {isLoading ? <Loader /> : "Login"}
        </Button>
        <span className="self-container">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary">
            Sign Up
          </Link>
        </span>
      </form>
    </Form>
  )
}

export default LoginPage

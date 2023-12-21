"use client"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@radix-ui/react-navigation-menu"
import { Button } from "../ui/button"
const Header = () => {
  return (
    <header className="p-4 flex justify-between items-center">
      <Link href={"/"} className="flex gap-2 justify-start items-center">
        <span className="font-semibold text-2xl md:text-4xl">squads</span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList className="flex items-center">
          <NavigationMenuItem>
            <Link href="/login">
              <Button variant={"ghost"} className="md:text-sm">
                Login
              </Button>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem className="ml-2">
            <Link href="/signup">
              <Button variant={"default"} size="sm" className="text-sm">
                Sign Up
              </Button>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}

export default Header

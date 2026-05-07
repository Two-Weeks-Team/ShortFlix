import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Compound Card primitive — quiet editorial surface (anti-ai voice).
 *
 * Usage:
 *  <Card>
 *    <Card.Header>...</Card.Header>
 *    <Card.Body>...</Card.Body>
 *    <Card.Footer>...</Card.Footer>
 *  </Card>
 */

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn(
      "card-quiet rounded-2xl border border-border bg-bg/60 backdrop-blur-sm",
      className
    )}
    {...rest}
  />
));
Root.displayName = "Card";

const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1 px-4 pt-4", className)}
    {...rest}
  />
));
Header.displayName = "CardHeader";

const Body = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div ref={ref} className={cn("px-4 py-3", className)} {...rest} />
));
Body.displayName = "CardBody";

const Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted",
      className
    )}
    {...rest}
  />
));
Footer.displayName = "CardFooter";

export const Card = Object.assign(Root, { Header, Body, Footer });

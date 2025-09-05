import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import CookieConsent from '../components/CookieConsent';

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="stylesheet" href="/src/app/global.css" />
      </head>
      <body>
        <Outlet />
        <CookieConsent />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
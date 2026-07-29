Library
/
README.md


IRONMAN AIP Calculator
A browser-based tool for calculating and forecasting All-In Pricing (AIP), including taxes, processing fees, refunds, and discounts.

Live site: https://aipcalculator.com

Features
Forward calculation: Base Price → Final AIP

Reverse calculation: Final AIP → Base Price

NJUKO match and exact-formula reverse methods

Edition-level pricing forecasts

Refund and discount modeling

CSV export for forecasts

Configurable tax, processing-fee, and rounding inputs

Currency display support for:

NZD

USD

EUR

GBP

AUD

CHF

Currency selection controls display formatting only. The app does not perform foreign-exchange conversion.

Tech Stack
React

TypeScript

Vite

Tailwind CSS

GitHub Actions

GitHub Pages

Run Locally
git clone https://github.com/avikcincy-sanju/refunds_studio.git
cd refunds_studio
npm install
npm run dev
Production Build
npm run build
The production output is created in:

dist/
Deployment
The app is deployed automatically through GitHub Actions whenever changes are pushed to the main branch.

Custom domain:

https://aipcalculator.com
The Vite base path for the custom domain is:

base: '/'
Main Files
src/components/CalculatorForm.tsx
src/utils/calculations.ts
src/components/EditionForecast.tsx
src/components/RefundsCalculator.tsx
src/components/DiscountsCalculator.tsx
public/aip-preview.png
index.html
vite.config.ts
Notes
GitHub Pages hosting is used.

HTTPS is enforced.

Calculations run entirely in the browser.

Do not add passwords, API keys, customer data, or confidential information to the repository.

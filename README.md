IRONMAN AIP Calculator / Forecast / Refund Studio



A browser-based pricing toolkit for calculating All-In Pricing (AIP), forecasting edition revenue, and modeling refunds and discounts.

The application is designed to make tax, processing-fee, and final-price calculations transparent and repeatable across different markets and currencies.

Overview

The studio contains four tools:

Tool

Purpose

AIP Calculator

Calculate the final All-In Price from a base price, or reverse-calculate the base price from a target AIP.

Edition Forecast

Forecast AIP, volume, tax, fees, and net revenue across individual and relay pricing tiers.

Refunds

Compare the original AIP breakdown with an adjusted breakdown based on a flat or percentage refund.

Discounts

Apply a flat or percentage discount to AIP and calculate the corresponding adjusted base price and fee breakdown.

Key Features

AIP Calculator

Forward calculation from Base Price → Final AIP

Reverse calculation from Final AIP → Base Price

Configurable:

GST / VAT / TAX percentage

Processing-fee percentage

GST / VAT / TAX on the processing fee

Calculation precision

Display currency

Two reverse-calculation approaches:

NJUKO Match — searches for a base price that reproduces the target AIP using two-decimal step rounding

Exact Formula — uses the direct mathematical reverse formula

Detailed calculation breakdown

Formula view and simplified explanation

Raw-precision display

Quick presets

Copy results to clipboard

Edition Forecast

Forward and reverse calculation modes

Up to 8 Individual Entry tiers

Up to 3 Relay Entry tiers

Base price or target AIP by tier

Volume by tier

Forecasts:

Final AIP

Total forecast AIP

Total GST / VAT / TAX

Total processing fees

Total tax on processing fees

Total net revenue

Average or blended AIP

Combined Individual + Relay summary

CSV download compatible with Microsoft Excel

Clear-all function

Refund Studio

Model refunds using:

Flat amount

Percentage

Compare the original and adjusted AIP breakdowns

Recalculate tax and processing-fee components

Copy the comparison to the clipboard

Discount Studio

Model discounts using:

Flat amount

Percentage

Apply the discount to the final AIP

Reverse-calculate the adjusted base price

Compare before-discount and after-discount results

Copy the comparison to the clipboard

Supported Currencies

The AIP Calculator currently supports:

Code

Currency

Display

NZD

New Zealand Dollar

NZ$

USD

US Dollar

$

EUR

Euro

€

GBP

British Pound

£

AUD

Australian Dollar

A$

CHF

Swiss Franc

CHF

Currency selection controls how values are labeled and displayed. The application does not perform foreign-exchange conversion.

Calculation Method

Forward AIP Calculation

Given:

B = Base Price

G = GST / VAT / TAX rate

P = Processing-fee rate

F = GST / VAT / TAX rate on the processing fee

The application calculates:

Tax on Base Price       = B × G
Price After Tax         = B + Tax on Base Price
Processing Fee          = Price After Tax × P
Tax on Processing Fee   = Processing Fee × F
Final AIP               = Price After Tax
                          + Processing Fee
                          + Tax on Processing Fee

The combined formula is:

Final AIP = B × (1 + G) × [1 + P × (1 + F)]

Exact Reverse Calculation

Base Price = Final AIP ÷ [(1 + G) × (1 + P × (1 + F))]

NJUKO Match Reverse Calculation

The NJUKO Match method:

Calculates an estimated base price.

Searches around that estimate.

Runs the forward calculation using two-decimal component rounding.

Selects the base price that exactly reproduces, or most closely reproduces, the requested AIP.

Displays the achieved AIP, difference, and nearby alternatives when applicable.

This method is useful when a direct reverse formula does not reproduce the target value because individual pricing components are rounded during the forward calculation.

Technology Stack

React 18

TypeScript

Vite

Tailwind CSS

Lucide React

GitHub Actions

GitHub Pages

Getting Started

Prerequisites

Install:

Node.js version 20 or later

npm, included with Node.js

Install the Project

git clone https://github.com/avikcincy-sanju/refunds_studio.git
cd refunds_studio
npm install

Run Locally

npm run dev

Vite will display a local URL, normally:

http://localhost:5173

Create a Production Build

npm run build

The production files will be created in:

dist/

Preview the Production Build

npm run preview

Available Commands

Command

Purpose

npm run dev

Start the local Vite development server

npm run build

Build the production application

npm run preview

Preview the production build locally

npm run lint

Run ESLint

npm run typecheck

Run TypeScript validation without generating files

Before publishing a change, run:

npm run typecheck
npm run lint
npm run build

Deployment

The repository includes a GitHub Actions workflow that automatically builds and deploys the application to GitHub Pages whenever code is pushed to the main branch.

Initial GitHub Pages Setup

In the GitHub repository:

Open Settings.

Select Pages.

Under Build and deployment, choose GitHub Actions.

Push or merge a change into main.

Open the Actions tab and confirm that the deployment completes successfully.

The expected application URL is:

https://avikcincy-sanju.github.io/refunds_studio/

Important Vite Setting

The repository is configured with:

base: '/refunds_studio/'

If the GitHub repository is renamed, update the base value in vite.config.ts to match the new repository name.

Example:

export default defineConfig({
  plugins: [react()],
  base: '/new-repository-name/',
});

Project Structure

refunds_studio/
├── .github/
│   └── workflows/
│       └── main.yml
├── src/
│   ├── components/
│   │   ├── CalculatorForm.tsx
│   │   ├── DiscountsCalculator.tsx
│   │   ├── EditionForecast.tsx
│   │   ├── ExamplePanel.tsx
│   │   ├── GstDropdown.tsx
│   │   ├── GstOnProcessingFeeDropdown.tsx
│   │   ├── ProcessingFeeDropdown.tsx
│   │   ├── RefundsCalculator.tsx
│   │   └── ResultsDisplay.tsx
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── exportExcel.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts

Adding Another Currency

Currency support is controlled in two places.

1. Add the Currency to the Selector

Update:

src/components/CalculatorForm.tsx

Example:

<option value="CAD">CAD - Canadian Dollar</option>

2. Add the Display Symbol

Update:

src/utils/calculations.ts

Example:

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NZD: 'NZ$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CHF: 'CHF ',
  CAD: 'C$',
};

This adds currency labeling only; it does not add exchange-rate conversion.

Data and Privacy

Calculations are performed in the browser.

The current calculator does not require users to upload personal data.

Forecast exports are generated locally in the browser.

No pricing data is sent to an external exchange-rate service.

Known Considerations

The Download to Excel function generates a .csv file that can be opened in Microsoft Excel.

The selected currency applies to display formatting in the AIP Calculator.

Tax and fee rules vary by market; users remain responsible for validating the rates entered.

Rounding behavior can cause a direct reverse calculation to differ slightly from a platform-generated AIP. Use NJUKO Match when step-rounded parity is required.

After a GitHub Pages deployment, a hard refresh may be needed to clear cached files:

Windows: Ctrl + Shift + R

macOS: Command + Shift + R

Feedback and Enhancements

For product feedback and enhancement requests, contact:

Frankie McDermondfrankie.mcdermond@ironman.com

When reporting a calculation issue, include:

Calculation mode

Base price or target AIP

Tax percentage

Processing-fee percentage

Tax percentage on the processing fee

Selected precision

Expected result

Actual result

Screenshot, when available

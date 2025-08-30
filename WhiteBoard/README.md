# donezo AI - WhiteBoard

## Overview

Meedro AI WhiteBoard is a dynamic, data-driven, visual workspace designed for content creators, marketers, and creative agencies. The application empowers users to aggregate various digital assets (videos, articles, social media content) on an infinite canvas. By integrating a powerful AI assistant that works directly with scraped and transcribed content, Meedro streamlines the creative process, transforming disparate online sources into structured, actionable insights and creative projects.

This project is being built in Firebase Studio.

## Core Features

- **Infinite Canvas:** A pannable and zoomable whiteboard for limitless creative space.
- **Content Windows:** Draggable and resizable frames for embedding various content types like YouTube videos, TikToks, Instagram posts, documents, images, and general URLs.
- **AI Assistant:** An intelligent assistant that can process content from the whiteboard to generate scripts, summaries, ideas, and more.
- **Automated Content Scraping:** Links added to the whiteboard are automatically processed by Apify to extract key content, such as video transcripts or article text.
- **Persistent Storage:** User data, whiteboards, and scraped content are securely stored using Supabase, ensuring your work is always saved.

## Tech Stack

- **Frontend:**
  - **Framework:** Next.js (with App Router)
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS
  - **UI Components:** ShadCN UI
- **Backend / AI:**
  - **AI Toolkit:** Genkit
  - **AI Models:** OpenAI
- **Data & Auth:**
  - **Database:** Supabase (PostgreSQL)
  - **Authentication:** Supabase Auth
- **Content Scraping:**
  - **Service:** Apify
- **Deployment:**
  - **Hosting:** Vercel

## Development Phases

The project is developed in the following phases:

1.  **Core Functionality (In Progress):** Build the whiteboard interface and content embedding.
2.  **Backend Integration:** Integrate Supabase for auth/database and Apify for content scraping.
3.  **Enhanced AI:** Enable the AI to use scraped content from the database.
4.  **Collaboration & Sharing:** Implement real-time multi-user support and sharing features.
5.  **Billing:** Introduce usage-based credit limits.

## Getting Started

To run this project locally:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your API keys:
    ```
    OPENAI_API_KEY=your_openai_api_key

    # Add Supabase and Apify keys when integrated
    # NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    # NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    # APIFY_TOKEN=your_apify_token
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

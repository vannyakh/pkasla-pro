#!/bin/bash
# Cloudflare Pages deployment script for Next.js
# CLOUDFLARE_API_TOKEN should be set in Cloudflare Pages environment variables

npx wrangler pages deploy .next --project-name=pkasla


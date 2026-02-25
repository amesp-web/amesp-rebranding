#!/usr/bin/env node
/**
 * Gera icon-192.png e icon-512.png a partir de public/favicon.png
 * para o PWA passar nos critérios de instalação do Chrome.
 */
import sharp from "sharp"
import { readFileSync, existsSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const faviconPath = join(root, "public", "favicon.png")
const out192 = join(root, "public", "icon-192.png")
const out512 = join(root, "public", "icon-512.png")

if (!existsSync(faviconPath)) {
  console.error("public/favicon.png não encontrado")
  process.exit(1)
}

const buf = readFileSync(faviconPath)
await sharp(buf).resize(192, 192).png().toFile(out192)
await sharp(buf).resize(512, 512).png().toFile(out512)
console.log("Gerados: public/icon-192.png, public/icon-512.png")

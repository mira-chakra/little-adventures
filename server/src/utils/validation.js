import { todayBeirut } from './weather.js';
import { z } from 'zod';
import { moodOptions, coverOptions } from '../models/Adventure.js';

const plainText = (min, max) => z.string().trim().min(min).max(max);
export const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid item ID');
export const registerSchema = z.object({
  name: plainText(2, 70),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72).regex(/[a-z]/, 'Include a lowercase letter').regex(/[A-Z]/, 'Include an uppercase letter').regex(/[0-9]/, 'Include a number')
}).strict();
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1) }).strict();
const url = z.union([z.literal(''),z.string().url().max(2000).refine(v=>v.startsWith('https://'),'Use an HTTPS URL')]);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v,'Use a real calendar date');
const categories=['other','heritage','museum','village','beach','waterfront','hiking','reserve','waterfall','viewpoint','food','park','religious'];
export const adventureSchema = z.object({
  title: plainText(3, 100),
  description: plainText(20, 1100),
  region: plainText(2, 75),
  location: plainText(2, 90),
  estimatedCost: z.number().finite().min(0).max(1000),
  durationMinutes: z.number().int().min(30).max(1440),
  moods: z.array(z.enum(moodOptions)).min(1).max(4),
  cover: z.enum(coverOptions).default('mountains'),
  imageUrl: z.union([z.literal(''),z.string().regex(/^\/photos\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/),z.string().url().max(2000).refine(v=>v.startsWith('https://'),'Use HTTPS or a bundled /photos/file.jpg path')]).default(''),
  tips: z.string().trim().max(350).default(''),
  category:z.enum(categories).default('other'), district:plainText(0,90).default(''),
  environment:z.enum(['indoor','outdoor','mixed','unknown']).default('unknown'),
  difficulty:z.enum(['easy','moderate','hard','unknown']).default('unknown'),
  latitude:z.number().finite().min(-90).max(90).nullable().default(null),
  longitude:z.number().finite().min(-180).max(180).nullable().default(null),
  costStatus:z.enum(['estimate','verified','unknown']).default('estimate'),
  activities:plainText(0,1000).default(''),bestSeason:plainText(0,200).default(''),
  openingHours:plainText(0,250).default(''),bookingUrl:url.default(''),sourceUrl:url.default(''),
  checkedOn:z.union([z.literal(''),date]).default(''),
  imageCredit:plainText(0,600).default(''),imageSource:url.default(''),imageLicense:plainText(0,150).default(''),
  status:z.enum(['draft','pending','published','rejected']).default('published')
}).strict();
export const updateAdventureSchema = z.object(Object.fromEntries(Object.entries(adventureSchema.shape).map(([key,field])=>[key,(field instanceof z.ZodDefault?field.removeDefault():field).optional()]))).strict().refine(data => Object.keys(data).length > 0, 'No fields provided');
export const filterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  region: z.string().trim().max(75).optional(),
  mood: z.enum(moodOptions).optional(),
  maxCost: z.coerce.number().finite().min(0).max(1000).optional(),
  maxMinutes: z.coerce.number().int().min(30).max(1440).optional(),
  category:z.enum(categories).optional(),environment:z.enum(['indoor','outdoor','mixed']).optional(),
  difficulty:z.enum(['easy','moderate','hard']).optional(),
  page:z.coerce.number().int().min(1).max(100000).default(1),
  limit:z.coerce.number().int().min(1).max(100).default(24)
}).strict();
export const recommendSchema = z.object({
  budget: z.number().finite().min(0).max(1000),
  availableMinutes: z.number().int().min(30).max(1440),
  mood: z.enum(moodOptions).optional(),
  moods:z.array(z.enum(moodOptions)).min(1).max(6).optional(),
  region: z.string().trim().max(75).optional().default(''),
  environment:z.enum(['','indoor','outdoor','mixed']).default(''),
  difficulty:z.enum(['','easy','moderate','hard']).default(''),
  latitude:z.number().finite().min(-90).max(90).nullable().default(null),
  longitude:z.number().finite().min(-180).max(180).nullable().default(null),
  date:date.optional(),useWeather:z.boolean().default(false),
  page:z.number().int().min(1).max(100000).default(1),limit:z.number().int().min(1).max(24).default(6)
}).strict();
export const favoriteUpdateSchema = z.object({ visited: z.boolean() }).strict();

export const importSchema=z.object({records:z.array(adventureSchema).min(1).max(100),dryRun:z.boolean().default(true)}).strict();
export const weatherQuerySchema=z.object({date:date.optional()}).strict();

export const visitSchema=z.object({visitedOn:date.refine(v=>v<=todayBeirut(),'Visit date cannot be in the future').nullable().default(null)}).strict();

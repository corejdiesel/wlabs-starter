import type { Block } from 'payload'

/**
 * The block library. Deliberately wide enough to cover an ordinary business
 * site without writing new blocks per project — block coverage is what keeps
 * a build inside a day. Each block stays internally narrow: few options, safe
 * defaults, and a description on every field so the admin explains itself.
 */

const linkFields: Block['fields'] = [
  { name: 'label', type: 'text', admin: { description: 'Button text. Leave blank to hide the button.' } },
  { name: 'href', type: 'text', admin: { description: 'e.g. /contact or https://example.com' } },
]

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  imageAltText: 'Large heading, short intro, optional image and button.',
  fields: [
    { name: 'heading', type: 'text', required: true, defaultValue: 'A short, clear headline' },
    { name: 'subheading', type: 'textarea', admin: { description: 'One or two sentences. Keep it brief.' } },
    {
      name: 'image', type: 'upload', relationTo: 'media',
      admin: { description: 'Optional. A placeholder is shown until you add one.' },
    },
    {
      name: 'layout', type: 'select', defaultValue: 'centered',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Image right', value: 'image-right' },
        { label: 'Full-bleed image', value: 'full-bleed' },
      ],
    },
    ...linkFields,
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text blocks' },
  imageAltText: 'A block of formatted text.',
  fields: [
    { name: 'content', type: 'richText', required: true },
    {
      name: 'width', type: 'select', defaultValue: 'narrow',
      options: [
        { label: 'Narrow (easiest to read)', value: 'narrow' },
        { label: 'Full width', value: 'wide' },
      ],
    },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    {
      name: 'size', type: 'select', defaultValue: 'contained',
      options: [
        { label: 'Contained', value: 'contained' },
        { label: 'Full width', value: 'full' },
      ],
    },
  ],
}

export const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    {
      name: 'images', type: 'array', minRows: 2, required: true,
      admin: { description: 'Two or more images, shown as a grid.' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'columns', type: 'select', defaultValue: '3',
      options: [
        { label: 'Two across', value: '2' },
        { label: 'Three across', value: '3' },
        { label: 'Four across', value: '4' },
      ],
    },
  ],
}

export const CTA: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  imageAltText: 'A highlighted band with a heading and a button.',
  fields: [
    { name: 'heading', type: 'text', required: true, defaultValue: 'Ready to talk?' },
    { name: 'body', type: 'textarea' },
    ...linkFields,
  ],
}

export const FeatureGrid: Block = {
  slug: 'featureGrid',
  labels: { singular: 'Feature grid', plural: 'Feature grids' },
  imageAltText: 'A row of short items — services, benefits, steps.',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items', type: 'array', minRows: 2, maxRows: 8, required: true,
      admin: { description: 'Between two and eight items.' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
        { name: 'icon', type: 'upload', relationTo: 'media', admin: { description: 'Optional small image or icon.' } },
      ],
    },
  ],
}

export const LogoStrip: Block = {
  slug: 'logoStrip',
  labels: { singular: 'Logos & quote', plural: 'Logos & quotes' },
  imageAltText: 'Client logos, optionally with a testimonial quote.',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Trusted by' },
    {
      name: 'logos', type: 'array',
      fields: [{ name: 'logo', type: 'upload', relationTo: 'media', required: true }],
    },
    { name: 'quote', type: 'textarea', admin: { description: 'Optional testimonial.' } },
    { name: 'attribution', type: 'text', admin: { description: 'Who said it, e.g. "Jane Doe, Acme Ltd".' } },
  ],
}

export const FormBlock: Block = {
  slug: 'formBlock',
  labels: { singular: 'Form', plural: 'Forms' },
  imageAltText: 'Embeds a form you built under Forms.',
  fields: [
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true },
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
  ],
}

export const blocks = [Hero, RichTextBlock, ImageBlock, Gallery, CTA, FeatureGrid, LogoStrip, FormBlock]

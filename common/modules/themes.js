import { append, element } from 'svelte/internal'
import { writable } from 'simple-store-svelte'

const style = element('style')
style.id = 'customThemes'
append(document.head, style)

export const variables = writable(localStorage.getItem('theme') || '')

variables.subscribe(value => {
  localStorage.setItem('theme', value)
  style.textContent = `:root{${value.replace(/{|}/g, '')}}`
})

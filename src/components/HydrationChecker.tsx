'use client'

import { useEffect } from 'react'

export function HydrationChecker() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Detectar extensões comuns que causam problemas de hidratação
      const checkForExtensions = () => {
        const body = document.body
        const suspiciousAttributes = [
          'cz-shortcut-listen',
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed',
          'spellcheck',
          'translate'
        ]
        
        const foundAttributes = suspiciousAttributes.filter(attr => 
          body.hasAttribute(attr)
        )
        
        if (foundAttributes.length > 0) {
          console.warn('🔧 Extensões do navegador detectadas que podem causar problemas de hidratação:', foundAttributes)
          console.warn('📝 Dica: Isso é normal e não afeta a funcionalidade da aplicação.')
        }
      }
      
      // Verificar imediatamente e após um pequeno delay
      checkForExtensions()
      setTimeout(checkForExtensions, 1000)
      
      // Observer para mudanças futuras
      const observer = new MutationObserver(() => {
        checkForExtensions()
      })
      
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed']
      })
      
      return () => observer.disconnect()
    }
  }, [])

  return null // Este componente não renderiza nada
} 
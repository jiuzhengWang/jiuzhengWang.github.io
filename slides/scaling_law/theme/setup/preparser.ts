import { definePreparserSetup } from '@slidev/types'

export default definePreparserSetup(() => {
  return [
    {
      name: 'pku-jyy-vertical-separators',
      transformRawLines(lines) {
        let fence: string | undefined

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const fenceMatch = line.match(/^(\s*)(```|~~~)/)

          if (fenceMatch) {
            const marker = fenceMatch[2]
            if (!fence)
              fence = marker
            else if (fence === marker)
              fence = undefined
          }

          if (!fence && line.trim() === '----') {
            lines.splice(i, 1, '---', 'jyyVertical: true', '---')
            i += 2
          }
        }
      },
    },
  ]
})

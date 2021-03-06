/** @module */
import marpitPlugin from '../marpit_plugin'

const bgSizeKeywords = {
  auto: 'auto',
  contain: 'contain',
  cover: 'cover',
  fit: 'contain',
}

/**
 * Marpit background image parse plugin.
 *
 * Parse Marpit's image token and mark as background image when the alternate
 * text includes `bg`. The marked images will not show as the regular image.
 *
 * Furthermore, it parses additional keywords needed for background image.
 *
 * @alias module:markdown/background_image/parse
 * @param {MarkdownIt} md markdown-it instance.
 */
function backgroundImageParse(md) {
  md.inline.ruler2.after(
    'marpit_parse_image',
    'marpit_background_image',
    ({ tokens }) => {
      for (const t of tokens) {
        if (t.type === 'image') {
          const { marpitImage } = t.meta

          if (t.meta.marpitImage.options.includes('bg')) {
            marpitImage.background = true
            t.hidden = true

            for (const opt of marpitImage.options) {
              // Background size keyword
              if (bgSizeKeywords[opt])
                marpitImage.backgroundSize = bgSizeKeywords[opt]

              // Split background keyword
              if (opt === 'left' || opt === 'right')
                marpitImage.backgroundSplit = opt

              // Background aligned direction
              if (opt === 'vertical' || opt === 'horizontal')
                marpitImage.backgroundDirection = opt
            }
          }
        }
      }
    }
  )
}

export default marpitPlugin(backgroundImageParse)

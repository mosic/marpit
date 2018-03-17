import postcss from 'postcss'
import postcssInlineSVGWorkaround from './postcss/inline_svg_workaround'
import postcssPrintable from './postcss/printable'
import postcssPseudoPrepend from './postcss/pseudo_selector/prepend'
import postcssPseudoReplace from './postcss/pseudo_selector/replace'
import Theme from './theme'
import scaffold from './theme/scaffold'

/**
 * Marpit theme set class.
 */
class ThemeSet {
  constructor() {
    this.default = undefined

    Object.defineProperty(this, 'themeMap', { value: new Map() })
  }

  /**
   * @param {string} css
   * @returns {Theme}
   */
  add(css) {
    const theme = Theme.fromCSS(css)

    this.addTheme(theme)
    return theme
  }

  /**
   * @param {Theme} theme
   */
  addTheme(theme) {
    if (!(theme instanceof Theme))
      throw new Error('ThemeSet can add only an instance of Theme.')

    if (typeof theme.name !== 'string')
      throw new Error('An instance of Theme requires name.')

    this.themeMap.set(theme.name, theme)
  }

  clear() {
    return this.themeMap.clear()
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  delete(name) {
    return this.themeMap.delete(name)
  }

  /**
   * @param {string} name
   * @param {boolean} [fallback=false] If true, return instance's default theme
   *     or scaffold theme when specified theme cannot find.
   * @returns {Theme|undefined}
   */
  get(name, fallback = false) {
    const theme = this.themeMap.get(name)
    return fallback ? theme || this.default || scaffold : theme
  }

  /**
   * @param  {string|Theme} theme
   * @param  {string} prop
   */
  getThemeProp(theme, prop) {
    const themeInstance = theme instanceof Theme ? theme : this.get(theme)

    return (
      (themeInstance && themeInstance[prop]) ||
      (this.default && this.default[prop]) ||
      scaffold[prop]
    )
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.themeMap.has(name)
  }

  /**
   * @param {string} name
   * @param {Object} [opts]
   * @param {Element[]} [opts.containers]
   * @param {boolean} [opts.inlineSVG]
   * @param {boolean} [opts.printable]
   * @return {string}
   */
  pack(name, opts = {}) {
    const slideElements = [{ tag: 'section' }]
    const theme = this.get(name, true)

    if (opts.inlineSVG)
      slideElements.unshift({ tag: 'svg' }, { tag: 'foreignObject' })

    const packer = postcss(
      [
        opts.printable &&
          postcssPrintable({
            width: this.getThemeProp(theme, 'width'),
            height: this.getThemeProp(theme, 'height'),
          }),
        theme !== scaffold && (css => css.first.before(scaffold.css)),
        postcssPseudoPrepend,
        postcssPseudoReplace(opts.containers, slideElements),
        opts.inlineSVG && postcssInlineSVGWorkaround,
      ].filter(p => p)
    )

    return packer.process(theme.css).css
  }

  /**
   * @returns {Iterator}
   */
  themes() {
    return this.themeMap.values()
  }
}

export default ThemeSet

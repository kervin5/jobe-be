import es from './es'
import en from './en'

export default (() => (process.env.APP_LANGUAGE === 'es' ? es : en))()

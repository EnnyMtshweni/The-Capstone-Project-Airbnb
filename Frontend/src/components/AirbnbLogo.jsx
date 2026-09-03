import logoUrl from '../assets/airbnb-logo.svg'

export default function AirbnbLogo({ className = '', label = 'Airbnb' }) {
  return <img className={`airbnb-logo-image${className ? ` ${className}` : ''}`} src={logoUrl} alt={label} />
}

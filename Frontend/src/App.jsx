import heroImg from './assets/hero.png'
import './App.css'

function App() {
  return (
    <main>
      <nav className="nav container" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="staywell home"><span>✦</span> staywell</a>
        <div className="nav-links">
          <a href="#stays">Find a stay</a>
          <a href="#inspiration">Inspiration</a>
          <a href="#hosting">Host your home</a>
        </div>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Change language">◎</button>
          <button className="profile-button" aria-label="Open profile menu">☰ <span>●</span></button>
        </div>
      </nav>

      <section className="hero container" id="top">
        <img src={heroImg} alt="Modern home surrounded by trees at sunset" />
        <div className="hero-overlay">
          <p className="eyebrow">Stay somewhere memorable</p>
          <h1>Make room<br />for the good stuff.</h1>
          <p className="hero-copy">Homes with a little more character, in places worth taking the long way to.</p>
          <a className="light-button" href="#stays">Explore stays <span>↗</span></a>
        </div>
        <div className="hero-credit">A quiet place to land <span>01 / 04</span></div>
      </section>

      <section className="search-panel container" aria-label="Search for a stay">
        <div className="search-field"><span className="field-label">Where</span><span>Search destinations</span></div>
        <div className="search-field"><span className="field-label">Check in</span><span>Add dates</span></div>
        <div className="search-field"><span className="field-label">Check out</span><span>Add dates</span></div>
        <div className="search-field guests"><span className="field-label">Guests</span><span>Add guests</span></div>
        <button className="search-button" aria-label="Search stays">⌕</button>
      </section>

      <section className="section container" id="stays">
        <div className="section-heading"><div><p className="eyebrow dark">Curated for you</p><h2>Places that feel like a find.</h2></div><a className="text-link" href="#all-stays">See all stays <span>→</span></a></div>
        <div className="category-row" id="inspiration">
          {['All stays', 'Coastal escapes', 'Cabin fever', 'City weekends', 'Slow mornings'].map((category, index) => <button className={index === 0 ? 'category active' : 'category'} key={category}>{category}</button>)}
        </div>
        <div className="listing-grid">
          <article className="listing-card"><div className="listing-image image-one"><span className="tag">Guest favourite</span><button aria-label="Save Modern retreat">♡</button></div><div className="listing-meta"><div><h3>Modern retreat in the treetops</h3><p>Hazyview, Mpumalanga</p></div><strong>R2,450 <small>night</small></strong></div></article>
          <article className="listing-card"><div className="listing-image image-two"><button aria-label="Save Beach house">♡</button></div><div className="listing-meta"><div><h3>Sun-washed beach house</h3><p>Saint Francis Bay, Eastern Cape</p></div><strong>R3,180 <small>night</small></strong></div></article>
          <article className="listing-card"><div className="listing-image image-three"><button aria-label="Save Farm stay">♡</button></div><div className="listing-meta"><div><h3>A slower kind of weekend</h3><p>Franschhoek, Western Cape</p></div><strong>R1,960 <small>night</small></strong></div></article>
        </div>
      </section>

      <section className="editorial container" id="hosting"><div><p className="eyebrow dark">The staywell edit</p><h2>More than four walls.</h2><p>Find the small details that turn a trip into a story you keep telling.</p><a className="dark-button" href="#journal">Read the journal <span>↗</span></a></div><div className="editorial-mark">✦</div></section>
      <footer className="footer container"><a className="brand" href="#top"><span>✦</span> staywell</a><p>Thoughtful stays, beautifully found.</p><span>© 2026 staywell</span></footer>
    </main>
  )
}

export default App

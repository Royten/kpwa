import spade from '../images/logo.png'
import style from '../styles/main.styl'

export default (text = 'Hi there!') => {
  const element = document.createElement('div')

  element.className = 'fa fa-hand-spock-o fa-lg'
  element.classList.add(style.marginTen)
  element.innerHTML = text

  const image = document.createElement('img')

  image.src = spade
  element.appendChild(image)

  element.onclick = () => {
    import('../lazy').then((lazy) => {
      element.textContent = lazy.default
    }).catch((err) => {
      console.error(err)
    })
  }

  return element
}

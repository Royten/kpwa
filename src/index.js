import 'react'

import 'purecss'
import 'font-awesome/css/font-awesome.css'

import component from './components'
import './styles/main.styl'

import { bake } from './shake'

bake()

document.body.appendChild(component('Some change'))

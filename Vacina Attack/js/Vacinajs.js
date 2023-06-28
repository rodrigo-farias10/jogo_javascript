// Teclas
const Teclas = [Esquerda, Cima, Direita, Baixo] = [37, 38, 39, 40]
let keyActions = {}

// Variavéis
const duracao = 20
let [score, bestScore, intervalo] = [0, 0, duracao]
let firstMove = true
let relogio
let lastUpdate = Date.now() // Iniciação do Tempo
let totalSegundos = 0

// Canvas
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
canvas.width = 850
canvas.height = 510

// Background
const backgroundObj = { image: new Image(), ready: false, speed: 100 }
backgroundObj.image.onload = () => backgroundObj.ready = true
backgroundObj.image.src = "img/Campo.png"

// Vacina
const VacinaObj = { speed: 400, width: 80, height: 80, image: new Image(), ready: false }
VacinaObj.image.onload = () => VacinaObj.ready = true
VacinaObj.image.src = "img/Vacina.png"

// Corona
const CoronaObj = { width: 60, height: 32, image: new Image(), ready: false }
CoronaObj.image.onload = () => CoronaObj.ready = true
CoronaObj.image.src = "img/Corona.png"

// Elementos
let tempoElem, scoreElem, bestScoreElem


function addEventListeners() {

	//Eventos quando Pressiona as Teclas.
	addEventListener("keydown", (e) => {
		if (!Teclas.find(key => e.keyCode === key)) return
		if (firstMove) {
			firstMove = false
			setTimer()
		}

		keyActions[e.keyCode] = true
	}, true)

	//Eventos quando Solta as teclas.
	addEventListener("keyup", (e) => {
		delete keyActions[e.keyCode]
	}, true)
}


function updateScoreAndTime(intervalo, score, bestScore) {
	tempoElem.setAttribute("value", '00 : ' + intervalo)
	bestScoreElem.setAttribute("value", 'Best score: ' + bestScore)
	scoreElem.setAttribute("value", score)
}

/* Posição onde a Vacina aparece */
function calculateFirstPositions() {

	if (firstMove) {
		// nascendo no meio da tela
		VacinaObj.x = (canvas.width / 2) - (VacinaObj.width / 2)
		VacinaObj.y = (canvas.height / 2) - (VacinaObj.height / 2)
	}

	// corona aleatorio no mapa
	CoronaObj.x = Math.round(Math.random() * (canvas.width - CoronaObj.width))
	CoronaObj.y = Math.round(Math.random() * (canvas.height - CoronaObj.height))
}


/**
Movendo a Vacina e vendo se acertou ou não o Corona.
*/
function updateElements(elapsed) {

	// distancia dos objetos e velocidade da vacina.
	const distancia = VacinaObj.speed * elapsed
	const VeloVacina = VacinaObj.width - 10
	const heightLimit = canvas.height - 10
	const widthLimit = canvas.width - 10

	// Tecla pra Cima
	if (keyActions.hasOwnProperty(Cima)) {
		// Atravessar /\
		(VacinaObj.y > -VeloVacina) ? VacinaObj.y -= distancia : VacinaObj.y = heightLimit
	}

	// Tecla pra Baixo
	if (keyActions.hasOwnProperty(Baixo)) {
		// Atravessar \/
		(VacinaObj.y < heightLimit) ? VacinaObj.y += distancia : VacinaObj.y = -VeloVacina
	}

	// Tecla pra Direita
	if (keyActions.hasOwnProperty(Direita)) {
		//  Atravessar >
		(VacinaObj.x < widthLimit) ? VacinaObj.x += distancia : VacinaObj.x = -VeloVacina
	}

	// Tecla pra Esquerda
	if (keyActions.hasOwnProperty(Esquerda)) {
		//  Atravessar <
		(VacinaObj.x > -VeloVacina) ? VacinaObj.x -= distancia : VacinaObj.x = widthLimit
	}

	// Acertou o Corona?
	if (VacinaObj.x <= (CoronaObj.x + (CoronaObj.width / 2)) &&
		VacinaObj.y <= (CoronaObj.y + (CoronaObj.height / 2)) &&
		CoronaObj.x <= (VacinaObj.x + (VacinaObj.width / 2)) &&
		CoronaObj.y <= (VacinaObj.y + (VacinaObj.height / 2))) {
		score++
		calculateFirstPositions()
	}
}

function paintElements(elapsed) {
	// Pra n ficar desenhando varias Vacinas no mapa
	// Movendo o mapa quando pressionado.
	if (!firstMove) {
		totalSegundos += elapsed

		const numImages = Math.ceil(canvas.width / backgroundObj.image.width)
		const xpos = (totalSegundos * backgroundObj.speed) % backgroundObj.image.width

		ctx.save()
		// Misturando o Canvas na tela mas sem desenhar.
		ctx.translate(-xpos, 0)

		// Tela infinita Rodando de fundo.
		for (let i = 0; i < numImages; i++) {
			// Tela do Fundo passando por dentro do canvas.
			ctx.drawImage(backgroundObj.image, i * backgroundObj.image.width, 0)
		}

		ctx.restore()
	} else {
		// Centralizando a imagem do fundo.
		ctx.drawImage(backgroundObj.image, 0, 0, backgroundObj.image.width, backgroundObj.image.height)
		totalSegundos = 0
	}

	// Tamanho da vacina 80x80
	ctx.drawImage(VacinaObj.image, VacinaObj.x, VacinaObj.y, VacinaObj.width, VacinaObj.height)
	// Tamanho do Corona 60x32
	ctx.drawImage(CoronaObj.image, CoronaObj.x, CoronaObj.y, CoronaObj.width, CoronaObj.height)
}

/**
Função principal do Programa.
 */
function main() {

	if (!backgroundObj.ready || !CoronaObj.ready || !VacinaObj.ready) return

	// Tempo pra Carregar e Rodar.
	const now = Date.now()
	const elapsed = (now - lastUpdate) / 1000


	updateElements(elapsed)

	paintElements(elapsed)

	updateScoreAndTime(String("0" + intervalo).slice(-2), score, bestScore)


	lastUpdate = now
}

/**
 Tempo do jogo.
 */
function setTimer() {
	relogio = setInterval(() => {
		// Game over 
		if (intervalo === 0) {
			clearInterval(relogio)
			firstMove = true
			intervalo = duracao
			score > bestScore ? bestScore = score : bestScore // Atualiza o Melhor score.
			score = 0
			return calculateFirstPositions()
		}

		// 1 segundo a menos.
		intervalo--
	}, 1000)
}

window.onload = function () {
	document.getElementById("board").appendChild(canvas)

	tempoElem = document.getElementById("clock")
	bestScoreElem = document.getElementById("bestscore")
	scoreElem = document.getElementById("score")

	updateScoreAndTime(intervalo, score, bestScore)
}

// Calculo de Posição
calculateFirstPositions()
addEventListeners()
// Jogo com 1 de MS 
setInterval(main, 16)
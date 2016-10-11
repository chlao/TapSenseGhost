var ghost = {
	wordInPlay: '', 
	wordList: [], 
	originalWordList: []
}; 

document.addEventListener('DOMContentLoaded', function(){
	var playButton = document.getElementById('playButton'); 
	playButton.addEventListener('click', function(){
		play(); 
	}); 
}); 

function play(){
	var loser;
	var playButton; 

	// Get the initial word list 
	if (ghost.originalWordList.length === 0){
		readWordList(); 
	} else{
		ghost.wordList = ghost.originalWordList; 
	}
	
	while (1){
		loser = humanPlay();
		if (loser){
			loser = 'human'; 
			break; 
		}

		loser = computerPlay();
		if (loser){
			loser = 'robot'; 
			break; 
		} 
	}

	playButton = document.getElementById('playButton'); 
	playButton.insertAdjacentHTML('afterend', '<p class="gameResult"> The loser is ' + loser + '</p>');

	// Reset values for next play 
	ghost.wordInPlay = ''; 
}

function readWordList(){
	var xhrFile = new XMLHttpRequest();
	xhrFile.open('GET', 'WORD.LST.txt', false);

	xhrFile.onreadystatechange = function(){
        if(xhrFile.readyState === 4){
            if(xhrFile.status === 200 || xhrFile.status == 0){
            	ghost.wordList = xhrFile.responseText.split('\n');
            	ghost.originalWordList = ghost.wordList.splice();
            }
        }
    }
    xhrFile.send(null); 
}

function filterWordList(){
	var low = 0; 
	var high = ghost.wordList.length - 1; 
	var mid; 
	var currWord, prefix; 
	var currIndex; 

	var results = []; 

	while (low <= high){
		mid = Math.floor((low + high)/2); 

		currWord = ghost.wordList[mid]; 
		prefix = currWord.substring(0, ghost.wordInPlay.length); 

		if (prefix === ghost.wordInPlay){
			currIndex = mid; 

			// Backtrack to find all word w/ word as prefix
			while (prefix === ghost.wordInPlay){
				currIndex--; 
				
				if (currIndex >= 0){
					currWord = ghost.wordList[currIndex]; 
					prefix = currWord.substring(0, ghost.wordInPlay.length); 
				} else{
					break;
				}
			}

			// Reset values 
			currIndex++;
			currWord = ghost.wordList[currIndex]; 
			prefix = currWord.substring(0, ghost.wordInPlay.length); 

			// Add all words w/ prefix to results 
			while (prefix === ghost.wordInPlay){
				results.push(currWord); 
				currIndex++;
				
				if (currIndex < ghost.wordList.length){
					currWord = ghost.wordList[currIndex]; 
					prefix = currWord.substring(0, ghost.wordInPlay.length); 
				} else{
					break;
				}
			}

			break; 
		} else if (prefix > ghost.wordInPlay){
			high = mid - 1; 
		} else{
			low = mid + 1; 
		}
	}
	ghost.wordList = results; 
}

function findWord(word){
	for (i = 0; i < ghost.wordList.length; i++){
		if (ghost.wordList[i] === word){
			return true; 
		}
	}
	return false; 
}

function isLoser(){
	var i; 
	var playButton;

	// Filter the word list to be consistent with the current word in play (based on the last move)
	filterWordList();

	// prefix is present in the list 
	if (ghost.wordList.length > 0){
		// LOSE: Word in play length is 4+ and builds a word in WORD.LST
		if (ghost.wordInPlay.length >= 4){
			if (findWord(ghost.wordInPlay)){
				playButton = document.getElementById('playButton');
				playButton.insertAdjacentHTML('afterend', '<p class="gameLog">Word ' + ghost.wordInPlay + ' completed. </p>');
				return true; 
			}
		}
	} else{ //LOSE: Word in play doesn't build a word in WORD.LST
		playButton = document.getElementById('playButton');
		playButton.insertAdjacentHTML('afterend', '<p class="gameLog">Word with prefix ' + ghost.wordInPlay + ' not found. </p>');
		return true; 
	}

	return false; 
}

function humanPlay(){
	var letter = prompt('The current word: ' + ghost.wordInPlay + '\nEnter a letter.');

	// Validate input - A-Z, a-z
	while (!validateInput(letter)){
		letter = prompt('The current word: ' + ghost.wordInPlay + '\nEnter a letter.');
	}

	ghost.wordInPlay += letter;

	return isLoser(); 
}

function validateInput(letter){
	if ((letter === null) || (letter.length !== 1) || (!/^[a-zA-Z]+$/.test(letter))){
		return false; 
	}
	return true; 
}

function computerPlay(){
	var randomNum; 
	var wordInPlayLen = ghost.wordInPlay.length; 

	// Calculate all winning moves 
	var winningMoves = calculateWinningMoves(); 
	var losingMoves; 

	// Computer thinks it will win
	if (winningMoves.length > 0){
		randomNum = Math.floor(Math.random() * winningMoves.length);
		ghost.wordInPlay += winningMoves[randomNum].substring(wordInPlayLen, wordInPlayLen + 1); 
	} else{ // Computer thinks it will lose 
		losingMoves = calculateLosingMoves(ghost.wordList); 

		randomNum = Math.floor(Math.random() * losingMoves.length);
		ghost.wordInPlay += losingMoves[randomNum].substring(wordInPlayLen, wordInPlayLen + 1); 
	}
	return isLoser();
}

function calculateWinningMoves(){
	// Look at words that are at least 2 letters longer 
	var requiredLen = ghost.wordInPlay.length + 2; 
	var winningMoves = []; 
	var word;
	var prefix; 

	var i; 

	for (i = 0; i < ghost.wordList.length; i++){
		word = ghost.wordList[i]; 

		// Keeps words that have the required length and an odd length 
		if((word.length >= requiredLen) && (word.length % 2 !== 0)){
			// Check if add next letter will complete the word 
			prefix = word.substring(0, requiredLen - 1);
			
			if ((prefix.length < 4) || (!findWord(prefix))){
				winningMoves.push(word);
			}
		}
	}

	return winningMoves; 
}

function calculateLosingMoves(){
	var maxLen = 0; 
	var losingMoves = []; 

	var i;  

	// Find the max length possible
	for (i = 0; i < ghost.wordList.length; i++){
		if (ghost.wordList[i].length > maxLen){
			maxLen = ghost.wordList[i].length; 
		}
	}

	// Find word with the max length 
	for (i = 0; i < ghost.wordList.length; i++){
		if (ghost.wordList[i].length === maxLen){
			losingMoves.push(ghost.wordList[i]); 
		}
	}

	return losingMoves; 
}
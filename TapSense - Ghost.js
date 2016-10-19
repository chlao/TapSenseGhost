var ghost = {
	wordInPlay: '', 
	wordList: [], 
	originalWordList: [], 
	minWordLen: 4
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
	var low = 0; 
	var high = ghost.wordList.length -1; 
	var mid; 

	while (low <= high){
		mid = Math.floor((low + high)/2); 
		if (word === ghost.wordList[mid]){
			return true; 
		} else if (word < ghost.wordList[mid]){
			high = mid -1; 
		} else{
			low = mid + 1; 
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
		if (ghost.wordInPlay.length >= ghost.minWordLen){
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

	ghost.wordInPlay += letter.toLowerCase();

	return isLoser(); 
}

function validateInput(letter){
	if ((letter === null) || (letter.length !== 1) || (!/^[a-zA-Z]+$/.test(letter))){
		return false; 
	}
	return true; 
}

function computerPlay(){
	const ascii_a = 97; 
	const ascii_z = 122; 

	var randomNum; 
	var wordInPlayLen = ghost.wordInPlay.length; 

	// Calculate all winning moves 
	var winningMoves = calculateWinningMoves();
	var losingMoves;	

	if (winningMoves.length > 0){ // Computer thinks it will win
		randomNum = Math.floor(Math.random() * winningMoves.length);
		ghost.wordInPlay += winningMoves[randomNum].substring(wordInPlayLen, wordInPlayLen + 1); 
	} else{ // Computer thinks it will lose 
		losingMoves = calculateLosingMoves(); 
		console.log(losingMoves);

		if (losingMoves.length > 0){
			randomNum = Math.floor(Math.random() * losingMoves.length);
			ghost.wordInPlay += losingMoves[randomNum].substring(wordInPlayLen, wordInPlayLen + 1); 
		} else{ // If there is no other possible move, play a random characterv
			randomNum = Math.floor(Math.random() * (ascii_z - ascii_a + 1)) + ascii_a;
			ghost.wordInPlay += String.fromCharCode(randomNum); 
		}
	}
	return isLoser();
}

function calculateWinningMoves(){
	// Look at words that are at least 2 letters longer 
	var requiredLen = ghost.wordInPlay.length + 2; 
	var winningMoves = []; 
	var word;
	var prefix; 
	var oddLength = []; 

	var alphabet = {}; 
	var potentialLetter; 

	var i; 

	// Find words that have an even length and keep track of what character they would add
	for (i = 0; i < ghost.wordList.length; i++){
		word = ghost.wordList[i]; 
		potentialLetter = word.charAt(ghost.wordInPlay.length); 

		if((word.length >= requiredLen) && (word.length % 2 === 0)){
			alphabet[potentialLetter] = true; 
		} else if((word.length >= requiredLen) && (word.length % 2 !== 0)){
			prefix = word.substring(0, requiredLen - 1);
			if ((prefix.length < ghost.minWordLen) || (!findWord(prefix))){
				oddLength.push(word);
			}
		}
	}

	for (i = 0; i < oddLength.length; i++){
		word = oddLength[i]; 
		potentialLetter = oddLength[i].charAt(ghost.wordInPlay.length); 

		// Keeps words that have the required length, an odd length, and whose character isn't present in an even word 
		if((word.length >= requiredLen) && (word.length % 2 !== 0) && (alphabet[potentialLetter] === undefined)){
			// Check if add next letter will complete the word 
			prefix = word.substring(0, requiredLen - 1);
			if ((prefix.length < ghost.minWordLen) || (!findWord(prefix))){
				winningMoves.push(word);
			}
		}
	}

	// If we are unable to find odd length word such that there is no even length word the user can play, return all odd-length words 
	//return winningMoves.length ? winningMoves : oddLength; 
	return winningMoves;
}

function calculateLosingMoves(){
	var losingMoves = []; 

	// Organize the words by length 
	var wordsByLength = {}; 
	var wordsByLengthPrefix = {}; 
	var wordLen; 
	var prefix; 
	var maxLen = 0;
	var maxLenPrefix = 0; 

	var i;  

	// The only word left to play is the one already in play
	if (ghost.wordList.length == 1 && ghost.wordList[0] == ghost.wordInPlay){
		return losingMoves; 
	}

	for (i = 0; i < ghost.wordList.length; i++){
		wordLen = ghost.wordList[i].length; 

		if (wordsByLength[wordLen] === undefined){
			wordsByLength[wordLen] = [ghost.wordList[i]]; 
		} else{
			wordsByLength[wordLen].push(ghost.wordList[i]); 
		}

		// Find the max length possible
		if (wordLen > maxLen){
			maxLen = wordLen; 
		}

		// Set without the words that complete when the next character is added
		prefix = ghost.wordList[i].substring(0, ghost.wordInPlay.length + 1); 

		if (prefix.length >= ghost.minWordLen && !findWord(prefix)){
			if (wordsByLengthPrefix[wordLen] === undefined){
				wordsByLengthPrefix[wordLen] = [ghost.wordList[i]]; 
			} else{
				wordsByLengthPrefix[wordLen].push(ghost.wordList[i]); 
			}

			if (wordLen > maxLenPrefix){
				maxLenPrefix = wordLen; 
			}
		}
	}

	// Return words that have the max length either 
	losingMoves = wordsByLengthPrefix[maxLenPrefix] || wordsByLength[maxLen]; 

	return losingMoves; 
}
# Ghost

In the game of Ghost, two players take turns building up an English word from left to right. 
Each player adds one letter per turn. The goal is to not complete the spelling of a word: 
if you add a letter that completes a word (of 4+ letters), or 
if you add a letter that produces a string that cannot be extended into a word, you lose. 
(Bluffing plays and "challenges" may be ignored for the purpose of this puzzle.)

Write a program that allows a user to play Ghost against the computer.

The computer should play optimally given the following dictionary: WORD.LST (1.66 MB). 
Allow the human to play first. If the computer thinks it will win, it should play randomly 
among all its winning moves; if the computer thinks it will lose, it should play so as to 
extend the game as long as possible (choosing randomly among choices that force the maximal game length).

In your submission email, answer this question: if the human starts the game with 'n', 
and the computer plays according to the strategy above, what unique word will complete the human's victory? 

## Viewing the app for development

An easy way to get this frontend-only app up and running is to cd into this directory in your terminal window, then run:

python -m SimpleHTTPServer 8080

## Details

- The Computer looks for winning moves by looking at odd-length word that currently begin with letters in play. 
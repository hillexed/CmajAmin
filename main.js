//In MIDI, C4 is defined as 60, and each note afterwards is one after the previous one; C# is 61, D is 62, etc.
var C4 = 60;

//compendium of scales
//Assumed that the beginning and end are both the same note
var MajorScaleIntervals = [2,2,1,2,2,2,1,2];
var MinorScaleIntervals = [2,1,2,2,1,2,2,2];

var CMajor = [60,62,64,65,67,69,71,72];

function notesInScale(scaleStartNote, scaleIntervals){
	//given a MIDI note and a set of intervals, return an array containing all the notes of the scale starting from scaleStartNote
	var note = scaleStartNote || 70;
	var notes = [];
	for(var i=0;i<scaleIntervals.length;i++){
		notes.push(note);
		note += scaleIntervals[i];
	}
	return notes;
}

window.onload = function () {
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			MIDI.setVolume(0, 127);
			MIDI.Player.stop();
		}
	});
};

function play(notes, bpm, velocity, swinginess){
	//Function to play a specific representation of a song through MIDI.js
	//notes is an array of quarter notes; if a given element is an array, though, treat the elements as subdivisions of a quarter note into equal smaller notes/rests. 
	//null = rest, number = MIDI number.

	//notes: an array of MIDI notes
	//bpm: a number
	//swinginess: 
	var velocity = velocity || 127; // how hard the note hits
	var bpm = bpm || 120;
	if(swinginess === undefined) swinginess = 0.1;

	var spb = 60 / bpm; //seconds per beat

	var quarterDelayBetweenNotes = spb / 4; 

	for(var i=0;i<notes.length;i++){
		if(notes[i] == null)continue; //rest

		if(typeof notes[i] == "number"){

			var noteStart = 1+i*quarterDelayBetweenNotes; //in seconds

			var noteEnd = noteStart + 1*quarterDelayBetweenNotes //assumed all notes are quarter notes, so only held for 1x more quarterDelayBetweenNotes

			MIDI.noteOn(0, notes[i], velocity, noteStart);
			MIDI.noteOff(0, notes[i], velocity, noteEnd);
		}else if(typeof notes[i] == "object"){ //array, implying shorter-than-quarter notes
			for(var j=0;j<notes[i].length;j++){
				//partition the beat into multiple even sections
				var noteDuration = quarterDelayBetweenNotes / notes[i].length;

				var noteStart = 1+i*quarterDelayBetweenNotes +j*noteDuration; //in seconds
				var noteEnd = 1+i*quarterDelayBetweenNotes   +(j+1)*noteDuration; //in seconds

				MIDI.noteOn(0, notes[i][j], velocity, noteStart);
				MIDI.noteOff(0, notes[i][j], velocity, noteEnd);
			}	
		}
	}
}

function playExample(notes){
	MIDI.Player.stop();
	play(notes,60,80,0);
	MIDI.Player.start();
}
function playExampleWithBass(notes,bassNotes){
	MIDI.Player.stop();
	play(notes,60,80,0);

	var bpm = 60;
	var spb = 60 / bpm; //seconds per beat
	var quarterDelayBetweenNotes = spb / 4; 
	for(var i=0;i<bassNotes.length;i++){
		if(bassNotes[i] !== null){
			console.log(bassNotes[i]);
			MIDI.chordOn(0, bassNotes[i], 80, i * quarterDelayBetweenNotes + 1);
			MIDI.chordOff(0, bassNotes[i], 80, i * quarterDelayBetweenNotes + 3);
		}
	}	
	MIDI.Player.start();
}

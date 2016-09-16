var C4 = 60;

//compendium of scales
//Assumed that the beginning and end are both the same note
var MajorScaleIntervals = [2,2,1,2,2,2,1,2];
var MinorScaleIntervals = [2,1,2,2,2,1,2,2];


function randomChoice(array){
	return array[Math.floor(Math.random()*array.length)];
}

function notesInScale(scaleStartNote, scaleIntervals){
	//given a MIDI note and a set of intervals, return an array containing all the notes of the scale
	var note = scaleStartNote || 70;
	var notes = [];
	for(var i=0;i<scaleIntervals.length;i++){
		notes.push(note);
		note += scaleIntervals[i];
	}
	return notes;
}


var CMajor = [60,62,64,65,67,69,71,72];


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
			
			//play([C4,C4,[null,C4],[null,C4], C4,C4,[null,C4],[null,C4], [C4,C4],[C4,C4],C4,C4, C4,null,null,null],60,80,0);	//grand
		}
	});
};

function play(notes, bpm, velocity, swinginess){
	//notes: an array of MIDI notes
	//bpm: a number
	//swinginess: 
	var velocity = velocity || 127; // how hard the note hits
	var bpm = bpm || 120;
	if(swinginess === undefined) swinginess = 0.1;

	var spb = 60 / bpm; //seconds per beat

	//4 notes per beat, for now assuming all notes are quarter notes
	var quarterDelayBetweenNotes = spb / 4; 

	for(var i=0;i<notes.length;i++){
		if(notes[i] == null)continue; //rest

		if(typeof notes[i] == "number"){

			var noteStart = 1+i*quarterDelayBetweenNotes; //in seconds

			//swing
			//since it is currently assumed all notes are quarter notes, just delay every other note for now.
			//todo: fix
			if(i % 2 == 0)noteStart += swinginess;

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

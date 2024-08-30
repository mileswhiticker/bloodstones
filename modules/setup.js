/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_setup", null, {
			
			/*
				setup:
				
				This method must set up the game user interface according to current game situation specified
				in parameters.
				
				The method is called each time the game interface is displayed to a player, ie:
				_ when the game starts
				_ when a player refreshes the game page (F5)
				
				"gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
			*/
			
			setup: function( gamedatas )
			{
				//console.log( "Starting game setup" );
				console.log(gamedatas);
				gameui = this;
				
				//some universal setup functions that apply as soon as we leave the lobby
				this.setupNotifications();
				this.ActivatePlayerPanel(gamedatas);
				
				//different "scenes" that have completely different UI
				switch(gamedatas.gamestate.name)
				{
					case("factionSelect"):
					{
						this.AddFactionSelectUI();
						break;
					}
					default:
					{
						//the standard game ui
						this.AddMainGameUI(gamedatas);
						break;
					}
				}
				
				//console.log( "Ending game setup" );
			},
			
			ResetPlayerInfo : function(players)
			{
				console.log("page::ResetPlayerInfo()");
				console.log(players);
				for(var player_id in players)
				{
					//get the updated faction id for this player from the server
					var player_info = players[player_id];
					//console.log(player_id);
					//console.log(player_info);
					
					//get the locally stored info about the player and update the saved faction id
					var player = this.gamedatas.players[player_id];
					player.factionid = player_info.player_factionid;
					player.villages_available = player_info.villages_available;
				}
			},
			
			ActivatePlayerPanel : function(gamedatas)
			{
				//these are the small player panels on the right of the game window
				//they are there the entire game so here we just make some tweaks to them
				for(var player_id in this.gamedatas.players)
				{
					if(player_id == this.player_id)
					{
						this.enablePlayerPanel(player_id);
					}
					else
					{
						this.disablePlayerPanel(player_id);
					}
				}
			},
			
		});
			
		return instance;
	}
);
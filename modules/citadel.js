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
		
		var instance = declare("_citadel", null, {
			//place your functions here
			
			BeginCitadelState : function()
			{
				this.UIBeginPlaceCitadel()
				//this.StartAnimatedCanvas(this.UICanvasRenderPlaceCitadelOverlay);
			},
			
			EndCitadelState : function(province_name)
			{
				//console.log("page::EndCitadelState(" + province_name + ")");
				if(this.possible_citadel_provinces.includes(province_name))
				{
					this.UIFinishPlaceCitadel();
					this.ServerPlaceCitadel(province_name);
				}
				else
				{
					console.log("WARNING: page::EndCitadelState(" + province_name + ") illegal province clicked");
				}
			},
			
			ServerPlaceCitadel : function(province_name)
			{
				//console.log("page::ServerPlaceCitadel()");
				
				//is this move allowed?
				if(window.gameui.checkAction('action_playerPlaceCitadel'))
				{
					//send this to the server
					//see action.php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_playerPlaceCitadel.html", {
						prov_name: province_name,
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
							
							// here we will reset the provisional move in the player's UI and refund the tiles spent
						}
					);
				}
			}
		});
		
		return instance;
	}
);

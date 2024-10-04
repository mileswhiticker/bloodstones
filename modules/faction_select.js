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
		
		var instance = declare("_faction_select", null, {
			//put your functions here
			
			AddFactionSelectUI : function(gamedatas)
			{
				//check if this ui has already been created
				if(dojo.byId("factionselect"))
				{
					return;
				}
				
				/*
				var page_title = dojo.byId("page-title");
				var title_marginbox = dojo.marginBox(page_title);
				var factionselect = dojo.byId("factionselect");
				//factionselect.style.width = title_marginbox.w + "px";
				factionselect.style.height = title_marginbox.w/1.75 + "px";
				*/
				
				dojo.place("<div id=\"factionselect\"></div>","gamewindow");
				dojo.place("<div id=\"bigtitle\"></div>","factionselect");
				dojo.place("<div id=\"factions\"></div>","factionselect");
				dojo.place("<div id=\"faction_info_holder\"></div>","factionselect");
				
				var max_factions = 6;
				//const factions_node = dojo.byId("factions");
				for(var faction_id = 0; faction_id < max_factions; faction_id++)
				{
					//what is the container node?
					var faction_id_string = this.getFactionContainerId(faction_id);
					
					//place the image logo of the faction
					dojo.place("<div id=\"" + faction_id_string + "\" class=\"faction\"></div>","factions");
					var factionlogo_id = this.getFactionLogoId(faction_id);
					var factionlogo = dojo.place("<div id=\"" + factionlogo_id + "\" class=\"factionlogo\"></div>",faction_id_string);
					
					//place a button for the player to choose this faction?
					var factionbutton_id = this.getFactionButtonId(faction_id);
					var factionbutton = dojo.place("<div id=\"" + factionbutton_id + "\" class=\"faction_title blst_button\">" + this.getChooseFactionTitleString(faction_id) + "</div>",faction_id_string);
					dojo.connect(factionbutton, "click", dojo.hitch(this, this.onClickFactionButton));
					
					//has a player already selected this faction?
					var faction_player_id = this.getFactionPlayerId(faction_id);
					if(faction_player_id > 0)
					{
						this.SetPlayerFactionChoice(faction_player_id, faction_id, -1);
					}
					
					dojo.connect(factionlogo, "click", dojo.hitch(this, this.onClickFactionLogo));
				}
			},
			
			RemoveFactionSelectUI : function()
			{
				dojo.destroy("factionselect");
			},
			
			onClickFactionLogo : function(event)
			{
				var faction_id = event.target.id.substring(11);
				//console.log("onClickFactionLogo() faction_id:" + faction_id);
				if(this.info_faction_id != faction_id)
				{
					window.gameui.SetFactionInfoUI(faction_id);
				}
				else
				{
					window.gameui.SetFactionInfoUI(-1);
				}
			},
			
			onClickFactionButton : function(event)
			{
				var faction_id = event.target.id.substring(13);
				//console.log("page::onClickFactionButton() faction_id: " + faction_id);
				var factionbutton_id = this.getFactionButtonId(faction_id);
				if(!dojo.hasClass(factionbutton_id,"blst_button"))
				{
					//only allow buttons to be clicked
					return;
				}
				var current_player_id = window.gameui.getCurrentPlayerId();
				var current_faction_id = window.gameui.getPlayerFactionId(current_player_id);
				//console.log("current_faction_id: " + current_faction_id);
				if(faction_id == current_faction_id)
				{
					this.TrySetPlayerFactionChoice(current_player_id, -1, current_faction_id)
					window.gameui.ServerUnchooseFaction(faction_id);
				}
				else
				{
					if(this.TrySetPlayerFactionChoice(current_player_id, faction_id, current_faction_id))
					{
						window.gameui.ServerChooseFaction(faction_id);
					}
				}
			},
			
			SetFactionInfoUI : function(faction_id)
			{
				if(this.isValidFactionId(this.info_faction_id))
				{
					var factionlogo_id = "factionlogo" + this.info_faction_id;
					//console.log("removing class from: " + factionlogo_id);
					dojo.removeClass(factionlogo_id, "faction_logo_selected");
				}
				
				this.info_faction_id = faction_id;
				dojo.destroy("info");
				if(faction_id >= 0)
				{
					dojo.place("<div id=\"info\" class=\"info" + faction_id + "\"></div>","faction_info_holder");
					var factionlogo_id = "factionlogo" + faction_id;
					dojo.addClass(factionlogo_id, "faction_logo_selected");
				}
			},
			
			TrySetPlayerFactionChoice: function(player_id, new_faction_id, old_faction_id)
			{
				if(this.getFactionPlayerId(new_faction_id) > 0)
				{
					//this feels like a bit of a hack but it should be fine
					//occasionally i will deliberately pass around an invalid player id as '-1'
					this.showMessage(_("That faction has already been taken"), "error");
					return false;
				}
				return true;
			},
			
			SetPlayerFactionChoice : function(player_id, new_faction_id, old_faction_id)
			{
				//console.log("page::SetPlayerFactionChoice(" + player_id + "," + new_faction_id + "," + old_faction_id + ")");
				if(this.gamedatas.gamestate.name != "factionSelect")
				{
					//at this point the gamestate has already changed, so there's no point doing any UI updates
					return;
				}
				//console.log("page::SetPlayerFactionChoice(" + player_id + "," + new_faction_id + "," + old_faction_id + ")");
				
				//is this a valid faction id?
				var unselect_old_faction = false;
				if(this.isValidFactionId(new_faction_id))
				{
					//add the selection UI effects to the new faction
					unselect_old_faction = true;
					
					//console.log("check1");
					var factionbutton_id = this.getFactionButtonId(new_faction_id);
					var factionbutton = dojo.byId(factionbutton_id);
					var faction_id_string = this.getFactionContainerId(new_faction_id);
					//dojo.addClass(factionbutton_id, "blst_button_disabled");
					
					//is it the current player that has a new selection?
					if(this.getCurrentPlayerId() == player_id)
					{
						//console.log("check2");
						factionbutton.textContent = this.getUnchooseFactionTitleString(new_faction_id);
						//dojo.addClass(faction_id_string, "faction_chosen");
						dojo.addClass(factionbutton_id, this.getFactionButtonSelectClass(new_faction_id));
					}
					else
					{
						//console.log("check3");
						dojo.removeClass(factionbutton_id, "blst_button");
						factionbutton.textContent = this.getPlayerFactionTitleString(player_id);
					}
					
					//finally, update the saved value
					this.gamedatas.players[player_id].factionid = new_faction_id;
				}
				else
				{
					//undo the faction selection choice for this player
					unselect_old_faction = true;
				}
				
				//remove the selection UI effects from the old faction
				if(unselect_old_faction && this.isValidFactionId(old_faction_id))
				{
					var factionbutton_id = this.getFactionButtonId(old_faction_id);
					var factionbutton = dojo.byId(factionbutton_id);
					dojo.addClass(factionbutton_id, "blst_button");
					factionbutton.textContent = this.getChooseFactionTitleString(old_faction_id);
					
					var faction_id_string = this.getFactionContainerId(old_faction_id);
					//dojo.removeClass(faction_id_string, "faction_chosen");
					dojo.removeClass(factionbutton_id, this.getFactionButtonSelectClass(old_faction_id));
				}
				
			},
			
			getFactionContainerId : function(faction_id)
			{
				return "faction" + faction_id;
			},
			
			getFactionButtonId : function(faction_id)
			{
				return "factionbutton" + faction_id;
			},
			
			getFactionLogoId : function(faction_id)
			{
				return "factionlogo" + faction_id;
			},
			
			getFactionTitleId : function(faction_id)
			{
				return "factiontitle" + faction_id;
			},
			
			getFactionButtonSelectClass : function(faction_id)
			{
				return "faction" + faction_id + "buttonselect";
			},
			
			getChooseFactionTitleString : function(faction_id)
			{
				return this.getFactionName(faction_id);
			},
			
			getUnchooseFactionTitleString : function()
			{
				return _("Unchoose faction");
			},
			
			getPlayerFactionTitleString : function(player_id)
			{
				return this.getPlayerName(player_id);
			},
			
			ServerChooseFaction : function(faction_id_arg)
			{
				//console.log("page::ServerChooseFaction(" + faction_id_arg + ")");
				//this move allows players to 'un-pass' and become active again
				//therefore we wont check if this action is allowed here
				//if(window.gameui.checkAction('action_chooseFaction'))
				{
					//console.log("success...");
					window.gameui.ajaxcall("/bloodstones/bloodstones/action_chooseFaction.html", {
						faction_id: faction_id_arg,
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
			},
			
			ServerUnchooseFaction : function(faction_id_arg)
			{
				//console.log("page::ServerUnchooseFaction(" + faction_id_arg + ")");
				//if(window.gameui.checkAction('action_unchooseFaction'))
				{
					//console.log("success...");
					window.gameui.ajaxcall("/bloodstones/bloodstones/action_unchooseFaction.html", {
						faction_id: faction_id_arg,
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
			},
			
		});
			
		return instance;
	}
);

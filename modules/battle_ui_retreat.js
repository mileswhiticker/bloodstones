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
		
		var instance = declare("_battle_ui_retreat", null, {
			//put your functions here
			
			CreateRetreatOverlayIfNotExists : function()
			{
				this.DestroyRetreatOverlay();
				this.CreateRetreatOverlay();
			},
			
			CreateRetreatOverlay : function()
			{
				//console.log("page::CreateRetreatOverlay()");
				//console.log(retreat_prov_options);
				//console.log(this.battling_province_name);
				//console.log(this.provinces_by_name)
				const start_province_info = this.provinces_by_name[this.battling_province_name];
				//console.log(start_province_info);
				
				//find the loser army that is here, they should have been automerged together
				//console.log(this.all_armies);
				var retreat_army;
				for(var i in this.all_armies)
				{
					var army_tilestack = this.all_armies[i];
					//console.log("checking: " + i + " | " + army_tilestack);
					//console.log("checking" + army_tilestack.id_string + " in " + army_tilestack.province_id);
					if(army_tilestack.province_id == this.battling_province_name)
					{
						//found it
						retreat_army = army_tilestack;
						//console.log("found the loser army");
						//console.log(retreat_army);
						break;
					}
				}
				
				for(var i in this.retreat_prov_options)
				{
					var retreat_option = this.retreat_prov_options[i]
					var adj_province_name = retreat_option.name;
					
					//grab some starting info
					//var adj_province_name = start_province_info.movement_links[j];
					//console.log(adj_province_name);
					var adj_province_info = this.provinces_by_name[adj_province_name];
					//console.log(adj_province_info)
					//console.log("checking adjacent province " + adj_province_name)
					
					//only two basic types of retreat
					var overlay_type = PROV_MOVE1;
					if(retreat_option.dangerous)
					{
						overlay_type = PROV_DANGER;
					}
					
					//add the province overlay and move link for that province
					this.SetProvinceOverlay(adj_province_info, overlay_type);
					this.AddProvinceMoveLink(start_province_info, adj_province_info, overlay_type);
				}
			},
			
			DestroyRetreatOverlay : function()
			{
				//see movemode_ui_addremove.js
				this.ClearCanvas();
			},
			
			RefreshRetreatOverlay : function()
			{
				if(this.isCurrentPlayerRetreatState())
				{
					this.DestroyRetreatOverlay();
					this.CreateRetreatOverlay();
				}
			},
		});
		
		return instance;
	}
);

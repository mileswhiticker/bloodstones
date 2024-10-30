
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_province_select_ui", null, {
			//put your functions here
			
			OnProvinceSelectDefaultMapOverlay : function(province_name)
			{
				//console.log("page::OnProvinceSelectDefaultMapOverlay()");
				
				this.UpdateCurrentOverlayMode();
			},
			
			OnProvinceUnselectDefaultMapOverlay : function(province_name)
			{
				//console.log("page::OnProvinceUnselectDefaultMapOverlay()");
				
				this.UpdateCurrentOverlayMode();
			},
			
			SetUIProvinceSelectionEmpty : function()
			{
				//todo: "selected_army" is still being created somehow in the old code
				
				//clear out old ui elements
				dojo.destroy("selection_container");
				dojo.place("<div id=\"selection_container\"</div>", "leftpanel");
				
				//add a hint telling the player they can select an army there
				//this.CreateArmySelectPanelTitle();
				dojo.place("<p class=\"ui_stack_title selected_stack_element\">" + this.GetUnselectedArmyHintString() + "</p>", "selection_container");
			},
			
			SetUIProvinceSelection : function(province_name)
			{
				//console.log("page::SetUIProvinceSelection(" + province_name + ")");
				//clear out old ui elements
				dojo.destroy("selection_container");
				var selection_container = dojo.place("<div id=\"selection_container\"</div>", "leftpanel");
				
				//reuse the same elements and layout, however adjust some of the strings and styling depending on the player, game state etc
				var action_mode = this.STATE_PLAYER_INACTIVE;
				if(this.isCurrentPlayerMoveMode())
				{
					action_mode = this.STATE_MAIN_MOVE;
				}
				
				//are there any movable armies in the province?
				var main_army_stack = this.selected_province_main_army;
				//console.log("main_army_stack:");
				//console.log(main_army_stack);
				var all_army_stacks = this.GetAllArmiesInProvince(province_name);
				
				//create a text title at the top of the panel
				var title_div = dojo.place("<h1 class=\"ui_stack_title\"></h1>", selection_container);
				if(main_army_stack)
				{
					//we have an army here so make this "our" province now
					title_div.innerHTML = this.GetProvinceSelectionPlayerTitleString(action_mode);
				}
				else if(all_army_stacks.length > 0 || false)
				{
					//only display player units in the main selection panel for now
					title_div.innerHTML = this.GetProvinceSelectionEnemyTitleString(action_mode);
					main_army_stack = this.GetFirstEnemyArmyInProvinceOrNull(province_name, this.player_id);
				}
				else
				{
					title_div.innerHTML = this.GetProvinceSelectionEmptyTitleString(action_mode);
				}
				
				//province info to display here
				var prov_id = this.GetProvinceIdFromName(province_name);
				var province_text = dojo.place("<div class=\"ui_selected_text\">" + this.GetProvinceNameUIString(prov_id) + "</div>", selection_container);
				
				//create tiles for the player tiles
				if(main_army_stack)
				{
					/*
					this.SelectArmyStack(main_army_stack);
					if(this.isCurrentPlayerMoveMode())
					{
						this.RefreshMoveModeUI();
					}
					*/
					
					main_army_stack.selectAll();
					
					this.selected_army_display_stack = new modules.TileStack();
					this.selected_army_display_stack.createAsArmySelection(this, "selection_container", main_army_stack);
				}
			},
			
			UnsetUIProvinceSelection : function()
			{
				//some necessary cleanup here
				dojo.destroy(this.GetArmySelectionStackDivId());
				this.selected_army_display_stack = null;
			},
		});
		
		return instance;
	}
);

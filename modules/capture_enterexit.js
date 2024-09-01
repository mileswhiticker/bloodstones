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
		
		var instance = declare("_capture_enterexit", null, {
			
			//note: these functions are only intended to be used for chaos horde capture action during their playerMain state
			//it might make sense to integrate the functionality with the "playerCapture" state but we'll see how i go
			EnterCaptureMode : function()
			{
				//console.log("page::EnterCaptureMode()");
				if(this.CanCurrentPlayerEnterCaptureMode())
				{
					//this.possible_capture_infos = args.args.possible_capture_infos;
					//console.log(args.args.possible_capture_infos);
					//this.UIInterfacePlayerCapture();
					//this.BeginCaptureState();
					this.enterSmallPhase(gameui.STATE_MAIN_CAPTURE);
					this.EnablePaymentBucket(gameui.STATE_MAIN_CAPTURE);
					this.UICanvasRenderCaptureOverlay();		//run once before the animation kicks in
					this.StartAnimatedCanvas(this.UICanvasRenderCaptureOverlay)
				}
			},
			
			CanCurrentPlayerEnterCaptureMode()
			{
				return (this.isCurrentPlayerChaosHorde() && this.isCurrentPlayerMainState());
			},
			
			ExitCaptureMode : function(approved)
			{
				//console.log("page::ExitCaptureMode(" + approved + ")");
				
				//if the player has no captures queued, then simply cancel this action
				if(this.queued_capture_village_ids.length == 0)
				{
					approved = false;
				}
				
				//was this action successful or cancelled?
				if(approved)
				{
					//console.log("move approved");
					//lock in the army stack movement by sending it to the server 
					//note: this includes army splits as well as moves
					this.LockPaymentBucket();
					this.ServerPayAction(this.ACTION_CAPTURE);
					this.enterSmallPhase(gameui.STATE_MAIN_RESET);
				}
				else
				{
					//console.log("move cancelled");
					//reset the planned captures
					this.CancelAllPlannedVillageCaptures();
					this.RefundPaystackTiles();
					this.DestroyPayWindow();
					this.enterSmallPhase(gameui.STATE_MAIN_DEFAULT);
				}
				
				//update the ui
				this.StopAnimatedCanvas();
				this.ClearCanvas();
			},
			
		});
		
		return instance;
	}
);
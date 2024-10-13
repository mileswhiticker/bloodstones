<?php

trait action
{
	function tryPayAction($action_type, $action_info, $paid_tile_infos, $paid_tile_ids)
	{
		//todo: replace $paid_tile_infos in this function with $paid_tile_ids
		//i've only done it for ACTION_CAPTURE and i'll need to do the rest later
		//see line 268 of action.php
		self::checkAction("action_tryPayAction");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPayAction($action_type)"));

		$owner_player_id = self::getCurrentPlayerId();
		$owner_player_name = self::getCurrentPlayerName();
		
		//todo: check if this action was allowed
		$success = false;
		$outcome_info = ["failure_reason" => self::ACTION_FAIL_UNKNOWN];
		switch($action_type)
		{
			//ACTION_UNKNOWN (0) is the default value
			
			case(self::ACTION_CAPTURE):
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPayAction() ACTION_CAPTURE"));
				
				//i am replacing the $success variable with a more nuanced struct containing info on the type of failure
				//todo: change the other action handling states to conform to this model
				if($this->getStateName() != "playerCapture" && !$this->IsCurrentPlayerChaosHorde())
				{
					$outcome_info = ["failure_reason" => self::ACTION_FAIL_STATE];
					break;
				}
				$outcome_info = $this->HandleCaptureAction($action_info, $paid_tile_ids);
				if($outcome_info["failure_reason"] == self::ACTION_SKIP || $outcome_info["failure_reason"] == self::ACTION_SUCCESS)
				{
					$success = true;
				}
				//for testing, allow failures to proceed
				//$success = true;
				break;
			}
			
			//move actions (1)
			case(self::ACTION_MOVE):
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPayAction() ACTION_MOVE"));
				
				$outcome_info = $this->HandleMoveAction($action_info, $paid_tile_infos, $paid_tile_ids);
				if($outcome_info["failure_reason"] <= 1)
				{
					$success = true;
				}
				break;
			}
				
			//case(self::ACTION_SPLIT):
			//2 is army splits, but those are included with a move action
			
			//build actions
			case(self::ACTION_BUILD):
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPayAction() ACTION_BUILD"));
				
				$outcome_info = $this->HandleBuildAction($action_info, $paid_tile_infos, $paid_tile_ids);
				if($outcome_info["failure_reason"] <= 1)
				{
					$success = true;
				}
				break;
			}
			
			//swap out a tile in combat
			case(self::ACTION_SWAP):
			{
				//todo: merge that other system into this one
				break;
			}
			
			case(self::ACTION_BUILDVILLAGE):
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPayAction() ACTION_BUILDVILLAGE"));
				
				if($this->getStateName() != "playerVillages")
				{
					$outcome_info = ["failure_reason" => self::ACTION_FAIL_STATE];
					break;
				}
				//this $success variable here is if the outcome was handled or not
				$success = true;
				$result = [];
				
				//check to see if the player is trying to pay with a tile that isn't in their hand
				if(!$this->CheckTilesInHand($paid_tile_infos, $owner_player_id))
				{
					$result["failure_reason"] = self::VILLAGE_FAIL_HAND;
				}
				else
				{
					//see villages.php
					$result = $this->tryPlayerBuildVillages($action_type, $action_info, $paid_tile_infos);
				}
				
				switch($result["failure_reason"])
				{
					case self::VILLAGE_SUCCESS:
					{
						//success
						self::notifyAllPlayers('newVillages', '', array(
							'player_id' => $owner_player_id,
							'villages_built' => $result["newly_built_villages"],
							'villages_available' => $this->countPlayerVillagesAvailable($owner_player_id)
						));
						
						//end the turn... players can only do 1 set of village building per turn
						$this->activePlayerCompleteState();
						break;
					}
					default:
					{
						self::notifyPlayer($owner_player_id, 'newVillagesFail', '', array(
							'failure_reason' => $result["failure_reason"]
						));
						
						break;
					}
				}
				break;
			}
		}
		
		if(!$success)
		{
			//throw new BgaUserException( self::_("tryPayAction() unknown failure") );
			//this should only occur if a user is cheating or exploiting a bug, possibly accidentally
			$failure_reason = $outcome_info["failure_reason"];
			throw new BgaUserException( self::_("server::tryPayAction() unhandled exception with code: $failure_reason") );
		}
	}
	
}
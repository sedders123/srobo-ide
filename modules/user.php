<?php

class UserModule extends Module
{
	private $settingsPath;

	public function __construct()
	{
		$config = Configuration::getInstance();
		$this->settingsPath = $config->getConfig('settingspath');
		$this->installCommand('info', array($this, 'getInfo'));
		$this->installCommand('settings-put', array($this, 'saveSettings'));
		$this->installCommand('settings-get', array($this, 'getSettings'));
	}

	public function getInfo()
	{
		$output = Output::getInstance();
		$auth   = AuthBackend::getInstance();
		if (!($username = $auth->getCurrentUser()))
		{
			throw new Exception('you are not logged in', E_PERM_DENIED);
		}
		$output->setOutput('display-name', $auth->displayNameForUser($username));
		$output->setOutput('email', $auth->emailForUser($username));
		$output->setOutput('teams', $auth->getCurrentUserTeams());
		$output->setOutput('is-admin', false);
	}

	public function saveSettings()
	{
		$input = Input::getInstance();
		$auth  = AuthBackend::getInstance();
		if (!($username = $auth->getCurrentUser()))
		{
			throw new Exception('you are not logged in', E_PERM_DENIED);
		}
		$settings = $input->getInput('settings');
		$data = json_encode($settings);
		file_put_contents("$this->settingsPath/$username.json", $data);
	}

	public function getSettings()
	{
		$output = Output::getInstance();
		$auth  = AuthBackend::getInstance();
		if (!($username = $auth->getCurrentUser()))
		{
			throw new Exception('you are not logged in', E_PERM_DENIED);
		}
		if (file_exists("$this->settingsPath/$username.json"))
		{
			$data = file_get_contents("$this->settingsPath/$username.json");
			$settings = json_decode($data);
		}
		else
		{
			$settings = array();
		}
		$output->setOutput('settings', $settings);
	}
}

<?php defined('SYSPATH') or die('No direct script access.'); 

if ($user->has_role('admin'))
{
?>
<div id="add-user">
<a href="/admin/users/add">Add user</a>
</div>
<?php
}
?>
<div id="user-list">
<?php
if (empty($users))
{
    echo 'No users registered';
} else {
?>
    <table>
    <tr>
        <td>Name</td>
        <td>Email</td>
        <td colspan="2">Allowed actions</td>
        
    </tr>    
<?php
    foreach ($users as $user)
    {
?>
        <tr>
        <td><?php echo $user->username;?></td>
        <td><?php echo $user->email;?></td>
        <td><a href="/admin/users/edit/<?php echo $user->id;?>">Edit</a></td>
        <td><a href="/admin/users/del/<?php echo $user->id;?>">Delete</a></td> 
        </tr>
<?php        
    }
?>
    </table>
<?php
}
?>
</div>
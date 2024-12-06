from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from werkzeug.exceptions import NotFound, Forbidden

from extensions.ext_database import db
from models.account import Account, TenantAccountJoin, TenantAccountRole
from services.account_service import TenantService

bp = Blueprint('workspace_members', __name__)

@bp.route('/api/workspaces/current/members/<member_id>/role', methods=['PUT'])
@login_required
def update_member_role(member_id):
    """Update member role"""
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if not new_role or not TenantAccountRole.is_valid_role(new_role):
            return jsonify({
                'error': 'Invalid role specified'
            }), 400

        # Get the target member
        member = Account.query.get(member_id)
        if not member:
            raise NotFound('Member not found')

        # Get current tenant
        tenant = current_user.current_tenant
        if not tenant:
            raise NotFound('Workspace not found')

        # Check if operator has permission
        if not current_user.is_owner:
            raise Forbidden('No permission to update member role')

        # Cannot change own role
        if current_user.id == member_id:
            raise Forbidden('Cannot change own role')

        # Update role
        TenantService.update_member_role(tenant, member, new_role, current_user)

        return jsonify({
            'result': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

@bp.route('/api/workspaces/current/members', methods=['GET'])
@login_required
def list_members():
    """List all members in current workspace"""
    tenant = current_user.current_tenant
    if not tenant:
        raise NotFound('Workspace not found')

    members = TenantService.get_tenant_members(tenant)
    
    return jsonify({
        'members': [{
            'id': member.id,
            'name': member.name,
            'email': member.email,
            'role': member.role,
            'status': member.status
        } for member in members]
    })

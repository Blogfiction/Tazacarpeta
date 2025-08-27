import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { Profile } from '../types/database';

export interface AdminUser extends Profile {
  id_role?: string;
  role_name?: string;
  role_description?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  city?: string;
  region?: string;
  country?: string;
  id_role: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  city?: string;
  region?: string;
  country?: string;
  id_role?: string;
  email?: string;
  password?: string;
}

export interface Role {
  id_role: string;
  role_name: string;
  description: string;
}

// Obtener todos los usuarios con sus roles
  export async function getAllUsers(): Promise<AdminUser[]> {
    try {
      // Usar supabaseAdmin para obtener todos los usuarios sin restricciones de políticas
      const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id_user, email, first_name, last_name, city, region, country, id_role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    // Luego obtener todos los roles
    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select('*');

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
      throw rolesError;
    }

    // Crear un mapa de roles para búsqueda rápida
    const rolesMap = new Map(rolesData.map(role => [role.id_role, role]));

    // Combinar usuarios con sus roles
    const result = usersData?.map(user => {
      const role = user.id_role ? rolesMap.get(user.id_role) : null;
      return {
        ...user,
        role_name: role?.role_name || null,
        role_description: role?.description || null
      };
    }) || [];

    return result;
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    throw error;
  }
}

// Obtener todos los roles disponibles
export async function getAllRoles(): Promise<Role[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('role_name');

    if (error) {
      console.error('❌ Error fetching roles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error in getAllRoles:', error);
    throw error;
  }
}

// Crear un nuevo usuario
export async function createUser(userData: CreateUserData): Promise<AdminUser> {
  try {
    console.log('🔍 createUser: Creando usuario con email:', userData.email);
    
    // Verificar si el email ya existe en auth.users
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Error checking existing users:', checkError);
      throw checkError;
    }
    
    const emailExists = existingUser.users.some(user => user.email === userData.email);
    if (emailExists) {
      throw new Error(`El email ${userData.email} ya está registrado en el sistema`);
    }
    
    // Crear usuario usando supabaseAdmin para NO iniciar sesión automáticamente
    // Esto evita que se cierre la sesión del admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        city: userData.city || null,
        region: userData.region || null,
        country: userData.country || null,
        id_role: userData.id_role
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    console.log('✅ Usuario auth creado exitosamente en auth.users');
    console.log('🔍 Usuario creado:', authData.user.id);

    // El trigger automático debería haber creado el perfil en public.users
    // Primero verificamos que existe el perfil
    console.log('🔍 Verificando que el perfil existe...');
    let profileData = null;
    
    // Esperar un poco para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Intentar obtener el perfil existente
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id_user', authData.user.id)
      .single();
    
    if (fetchError || !existingProfile) {
      console.log('⚠️ Perfil no encontrado, creando manualmente...');
      // Si no existe, lo creamos manualmente
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id_user: authData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          city: userData.city || null,
          region: userData.region || null,
          country: userData.country || null,
          id_role: userData.id_role,
          email: userData.email
        })
        .select('*')
        .single();
      
      if (createError) {
        console.error('❌ Error creating user profile manually:', createError);
        throw new Error('No se pudo crear el perfil del usuario');
      }
      
      profileData = newProfile;
      console.log('✅ Perfil creado manualmente:', profileData);
    } else {
      console.log('✅ Perfil encontrado, actualizando...');
      // Si existe, lo actualizamos
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          city: userData.city || null,
          region: userData.region || null,
          country: userData.country || null,
          id_role: userData.id_role
        })
        .eq('id_user', authData.user.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ Error updating user profile:', updateError);
        // Usar el perfil existente si falla la actualización
        profileData = existingProfile;
      } else {
        profileData = updatedProfile;
        console.log('✅ Perfil actualizado exitosamente');
      }
    }

    // Obtener el rol del usuario creado
    let roleName = null;
    let roleDescription = null;
    
    if (profileData.id_role) {
      console.log('🔍 Obteniendo información del rol...');
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('role_name, description')
        .eq('id_role', profileData.id_role)
        .single();
      
      if (roleError) {
        console.error('❌ Error fetching role data:', roleError);
        // No fallar por esto, solo log del error
      } else if (roleData) {
        roleName = roleData.role_name;
        roleDescription = roleData.description;
        console.log('✅ Rol obtenido:', roleData);
      }
    }

    const result = {
      ...profileData,
      role_name: roleName,
      role_description: roleDescription
    };

    console.log('✅ Usuario creado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in createUser:', error);
    throw error;
  }
}

// Actualizar un usuario
export async function updateUser(userId: string, userData: UpdateUserData): Promise<AdminUser> {
  try {
    console.log('🔍 updateUser: Actualizando usuario...', { userId, userData });
    
    // Separar datos para auth.users vs public.users
    const authUpdateData: any = {};
    const publicUpdateData: any = {};
    
    // Email y password van a auth.users
    if (userData.email !== undefined) authUpdateData.email = userData.email;
    if (userData.password !== undefined) authUpdateData.password = userData.password;
    
    // Todos los demás campos van a public.users
    if (userData.first_name !== undefined) publicUpdateData.first_name = userData.first_name;
    if (userData.last_name !== undefined) publicUpdateData.last_name = userData.last_name;
    if (userData.city !== undefined) publicUpdateData.city = userData.city;
    if (userData.region !== undefined) publicUpdateData.region = userData.region;
    if (userData.country !== undefined) publicUpdateData.country = userData.country;
    if (userData.id_role !== undefined) publicUpdateData.id_role = userData.id_role;
    
    // IMPORTANTE: Si se cambia el email, también actualizarlo en public.users
    if (userData.email !== undefined) publicUpdateData.email = userData.email;
    
    console.log('🔍 Datos para auth.users:', authUpdateData);
    console.log('🔍 Datos para public.users:', publicUpdateData);
    
    // 1. Actualizar auth.users si hay cambios en email o password
    if (Object.keys(authUpdateData).length > 0) {
      console.log('🔍 Actualizando auth.users...');
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdateData);
      
      if (authError) {
        console.error('❌ Error updating auth user:', authError);
        throw authError;
      }
      console.log('✅ Usuario auth actualizado');
    }
    
    // 2. Actualizar public.users
    if (Object.keys(publicUpdateData).length > 0) {
      console.log('🔍 Actualizando public.users...');
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(publicUpdateData)
        .eq('id_user', userId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error updating public.users:', error);
        throw error;
      }
      console.log('✅ Usuario public.users actualizado:', data);
    } else {
      // Si no hay cambios en public.users, obtener los datos actuales
      console.log('🔍 No hay cambios en public.users, obteniendo datos actuales...');
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id_user', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching updated user:', error);
        throw error;
      }
      console.log('✅ Datos actuales obtenidos:', data);
    }

    // Obtener el rol del usuario actualizado
    let roleName = null;
    let roleDescription = null;
    
    if (publicUpdateData.id_role || (publicUpdateData.id_role === undefined && userData.id_role !== undefined)) {
      const roleId = publicUpdateData.id_role || userData.id_role;
      console.log('🔍 Obteniendo información del rol...', roleId);
      
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('role_name, description')
        .eq('id_role', roleId)
        .single();
      
      if (roleData) {
        roleName = roleData.role_name;
        roleDescription = roleData.description;
        console.log('✅ Rol obtenido:', roleData);
      }
    }

    const result = {
      ...publicUpdateData,
      role_name: roleName,
      role_description: roleDescription
    };

    console.log('✅ Usuario actualizado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    throw error;
  }
}

// Eliminar un usuario
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log('🔍 deleteUser: Eliminando usuario...', userId);
    
    // Primero eliminar el perfil usando supabaseAdmin
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id_user', userId);

    if (profileError) {
      console.error('❌ Error deleting user profile:', profileError);
      throw profileError;
    }

    console.log('✅ Perfil de usuario eliminado');

    // Luego eliminar el usuario de auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('❌ Error deleting auth user:', authError);
      throw authError;
    }

    console.log('✅ Usuario auth eliminado');
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    throw error;
  }
}

// Cambiar contraseña de un usuario
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  try {
    console.log('🔍 updateUserPassword: Cambiando contraseña...', userId);
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error('❌ Error updating user password:', error);
      throw error;
    }

    console.log('✅ Contraseña actualizada exitosamente');
  } catch (error) {
    console.error('❌ Error in updateUserPassword:', error);
    throw error;
  }
}

// Obtener estadísticas de usuarios
export async function getUserStats() {
  try {
    console.log('📊 getUserStats: Obteniendo estadísticas...');
    
    // Obtener usuarios con sus roles usando supabaseAdmin
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id_role');

    if (usersError) {
      console.error('❌ Error fetching users for stats:', usersError);
      throw usersError;
    }

    console.log(`✅ Usuarios para stats: ${usersData?.length || 0}`, usersData);

    // Obtener todos los roles usando supabaseAdmin
    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select('id_role, role_name');

    if (rolesError) {
      console.error('❌ Error fetching roles for stats:', rolesError);
      throw rolesError;
    }

    console.log(`✅ Roles para stats: ${rolesData?.length || 0}`, rolesData);

    // Crear mapa de roles
    const rolesMap = new Map(rolesData.map(role => [role.id_role, role.role_name]));

    const stats = {
      total: usersData?.length || 0,
      byRole: {} as Record<string, number>
    };

    usersData?.forEach((user: any) => {
      const roleName = user.id_role ? rolesMap.get(user.id_role) || 'Sin rol' : 'Sin rol';
      stats.byRole[roleName] = (stats.byRole[roleName] || 0) + 1;
    });

    console.log('✅ Estadísticas finales:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error in getUserStats:', error);
    throw error;
  }
}

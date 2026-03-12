// Supabase Edge Function: wechat-login
// 处理微信小程序登录

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const WECHAT_APPID = Deno.env.get('WECHAT_APPID') || ''
const WECHAT_SECRET = Deno.env.get('WECHAT_SECRET') || ''

serve(async (req) => {
  try {
    const { code } = await req.json()
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: '缺少授权码' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 调用微信接口获取 openid 和 session_key
    const wechatUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`
    
    const wechatRes = await fetch(wechatUrl)
    const wechatData = await wechatRes.json()
    
    if (wechatData.errcode) {
      return new Response(
        JSON.stringify({ error: wechatData.errmsg }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { openid, unionid, session_key } = wechatData

    // 创建 Supabase 客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // 检查用户是否已存在
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      // 更新用户信息
      await supabaseClient
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId)
    } else {
      // 创建新用户
      // 首先创建 auth 用户
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
        email: `${openid}@wechat.pawpal.app`,
        email_confirm: true,
        user_metadata: { openid, unionid },
      })

      if (authError) throw authError

      userId = authUser.user.id

      // 创建用户记录
      await supabaseClient.from('users').insert({
        id: userId,
        openid,
        unionid,
      })
    }

    // 生成 JWT token
    const { data: { session }, error: signError } = await supabaseClient.auth.signInWithPassword({
      email: `${openid}@wechat.pawpal.app`,
      password: openid, // 使用 openid 作为密码
    })

    if (signError) {
      // 如果登录失败，尝试更新密码后重新登录
      await supabaseClient.auth.admin.updateUserById(userId, {
        password: openid,
      })
      
      const { data: { session: newSession } } = await supabaseClient.auth.signInWithPassword({
        email: `${openid}@wechat.pawpal.app`,
        password: openid,
      })

      return new Response(
        JSON.stringify({
          user: { id: userId, openid, unionid },
          session: newSession,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        user: { id: userId, openid, unionid },
        session,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
